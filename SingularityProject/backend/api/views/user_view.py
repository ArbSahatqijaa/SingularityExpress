from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from api.serializers.user_serializer import UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.mail import send_mail, get_connection, EmailMessage
from django.conf import settings
from django.db.models import Q  
from asgiref.sync import sync_to_async, async_to_sync
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
import queue
import logging
import os
from concurrent.futures import ThreadPoolExecutor

import random

logger = logging.getLogger(__name__)

User = get_user_model()

# Create a thread pool for email sending
email_executor = ThreadPoolExecutor(max_workers=1)


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Overrides DRF's SessionAuthentication to skip CSRF checks.
    """
    def enforce_csrf(self, request):
        return  # no-op: skip CSRF


class UserListCreateView(APIView):
    authentication_classes = (
        CsrfExemptSessionAuthentication,
        JWTAuthentication,
    )

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_authenticators(self):
        if self.request.method == 'POST':
            return [CsrfExemptSessionAuthentication()]
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, format=None):
        users = User.objects.all()  # Query all User instances
        
        role = request.GET.get('role')
        academic_title = request.GET.get('academic_title')
        profession = request.GET.get('profession')

        if role:
            users = users.filter(role__iexact=role)
        if academic_title:
            users = users.filter(academic_title__iexact=academic_title)
        if profession:
            users = users.filter(profession__iexact=profession)

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        # Create a serializer instance with the provided data (multipart form-data for file uploads)
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the user with images
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # If the data is invalid, return errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        user = self.get_object(pk)
        data = request.data.copy()

        # If password is provided, hash it
        if 'password' in data:
            data['password'] = make_password(data['password'])

        serializer = UserSerializer(user, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, format=None):
        user = self.get_object(pk)
        data = request.data.copy()

        if 'password' in data:
            data['password'] = make_password(data['password'])

        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def send_email_sync(subject, message, from_email, recipient_list):
    """Synchronous email sending function that works with both runserver and Daphne"""
    try:
        logger.info("="*50)
        logger.info("EMAIL SENDING DEBUG INFO:")
        logger.info(f"Attempting to send email to {recipient_list}")
        logger.info(f"Email settings:")
        logger.info(f"- Host: {settings.EMAIL_HOST}")
        logger.info(f"- Port: {settings.EMAIL_PORT}")
        logger.info(f"- User: {settings.EMAIL_HOST_USER}")
        logger.info(f"- Use TLS: {settings.EMAIL_USE_TLS}")
        logger.info(f"- From email: {from_email}")
        logger.info(f"- Subject: {subject}")
        logger.info(f"- Message length: {len(message)}")
        logger.info("="*50)
        
        # Test SMTP connection first
        try:
            with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=30) as smtp:
                logger.info("Testing SMTP connection...")
                smtp.starttls()
                logger.info("TLS started successfully")
                smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                logger.info("SMTP login successful")
        except Exception as e:
            logger.error(f"SMTP connection test failed: {str(e)}", exc_info=True)
            raise
        
        # Send email using Django's send_mail
        logger.info("Attempting to send email using Django's send_mail...")
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
            auth_user=settings.EMAIL_HOST_USER,
            auth_password=settings.EMAIL_HOST_PASSWORD
        )
        
        logger.info(f"Email send result: {result}")
        if result == 0:
            raise Exception("Email send returned 0 (no recipients)")
        logger.info("Email sent successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}", exc_info=True)
        logger.error("Full error details:", exc_info=True)
        raise


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ()  # Allow unauthenticated access

    def post(self, request, format=None):
        logger.info("="*50)
        logger.info("PASSWORD RESET REQUEST:")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request headers: {request.headers}")
        
        email = request.data.get('email')
        if not email:
            logger.error("No email provided in request")
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            logger.info(f"Processing password reset request for email: {email}")
            user = User.objects.get(email=email)
            logger.info(f"Found user: {user.username} (ID: {user.user_id})")
            
            # Generate a 6-digit code
            reset_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            logger.info(f"Generated reset code for {email}: {reset_code}")
            
            # Store the code in the user's refresh_token field temporarily
            user.refresh_token = reset_code
            user.save()
            logger.info(f"Saved reset code for user {user.username}")

            # Send email with reset code
            subject = 'Password Reset Code - Singularity Express'
            message = f'''
Hello {user.first_name},

You have requested to reset your password for Singularity Express.
Your password reset code is: {reset_code}

If you did not request this password reset, please ignore this email.

Best regards,
Singularity Express Team
'''
            try:
                logger.info(f"Starting password reset email process for {email}")
                success = send_email_sync(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email]
                )
                
                if success:
                    logger.info(f"Successfully sent reset code email to {email}")
                    return Response({
                        'message': 'If an account exists with this email, a reset code has been sent'
                    })
                else:
                    raise Exception("Email sending failed")
                    
            except Exception as e:
                logger.error(f"Failed to send reset code email: {str(e)}", exc_info=True)
                # If email sending fails, clear the reset code
                user.refresh_token = None
                user.save()
                logger.error("Cleared reset code due to email sending failure")
                return Response(
                    {'error': 'Failed to send reset code. Please try again later.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except User.DoesNotExist:
            logger.info(f"Password reset requested for non-existent email: {email}")
            # Don't reveal that the email doesn't exist
            return Response({
                'message': 'If an account exists with this email, a reset code has been sent'
            })
        except Exception as e:
            logger.error(f"Unexpected error in password reset: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, format=None):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not all([email, code, new_password]):
            return Response(
                {'error': 'Email, code, and new password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            if user.refresh_token != code:
                return Response(
                    {'error': 'Invalid reset code'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update password and clear reset code
            user.set_password(new_password)
            user.refresh_token = None
            user.save()

            return Response({'message': 'Password updated successfully'})

        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email'}, 
                status=status.HTTP_400_BAD_REQUEST
            )