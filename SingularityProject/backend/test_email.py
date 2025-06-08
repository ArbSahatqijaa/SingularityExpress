import os
import django
import logging

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from django.core.mail import send_mail, get_connection
from django.conf import settings
import smtplib

def test_smtp_connection():
    """Test SMTP connection directly"""
    try:
        logger.info("Testing SMTP connection...")
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=30) as smtp:
            logger.info("Starting TLS...")
            smtp.starttls()
            logger.info("TLS started successfully")
            logger.info("Attempting login...")
            smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            logger.info("Login successful!")
            return True
    except Exception as e:
        logger.error(f"SMTP connection test failed: {str(e)}", exc_info=True)
        return False

def test_email_send():
    """Test sending an email using Django's email backend"""
    try:
        logger.info("Testing email send...")
        logger.info(f"Email settings:")
        logger.info(f"Host: {settings.EMAIL_HOST}")
        logger.info(f"Port: {settings.EMAIL_PORT}")
        logger.info(f"User: {settings.EMAIL_HOST_USER}")
        logger.info(f"Use TLS: {settings.EMAIL_USE_TLS}")
        
        # Create connection
        connection = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_HOST_USER,
            password=settings.EMAIL_HOST_PASSWORD,
            use_tls=settings.EMAIL_USE_TLS,
            timeout=30
        )
        
        # Send test email
        result = send_mail(
            subject='Test Email from Django',
            message='This is a test email to verify the email configuration.',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=False,
            connection=connection
        )
        
        logger.info(f"Email send result: {result}")
        return result > 0
    except Exception as e:
        logger.error(f"Email send test failed: {str(e)}", exc_info=True)
        return False

if __name__ == '__main__':
    print("\nTesting SMTP Connection...")
    if test_smtp_connection():
        print("SMTP connection test: SUCCESS")
    else:
        print("SMTP connection test: FAILED")
    
    print("\nTesting Email Send...")
    if test_email_send():
        print("Email send test: SUCCESS")
    else:
        print("Email send test: FAILED") 