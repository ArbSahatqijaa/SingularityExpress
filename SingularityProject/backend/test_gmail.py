import os
import django
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from django.conf import settings

def test_gmail_direct():
    """Test Gmail SMTP connection and sending directly using smtplib"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_HOST_USER
        msg['To'] = settings.EMAIL_HOST_USER  # Send to self
        msg['Subject'] = "Test Email from Python"
        
        body = "This is a test email sent directly using Python's smtplib"
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to Gmail
        logger.info("Connecting to Gmail SMTP...")
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        
        # Login
        logger.info("Logging in...")
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        
        # Send email
        logger.info("Sending email...")
        text = msg.as_string()
        server.sendmail(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_USER, text)
        
        # Close connection
        server.quit()
        logger.info("Email sent successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}", exc_info=True)
        return False

if __name__ == '__main__':
    print("\nTesting Gmail SMTP directly...")
    if test_gmail_direct():
        print("Gmail test: SUCCESS")
    else:
        print("Gmail test: FAILED") 