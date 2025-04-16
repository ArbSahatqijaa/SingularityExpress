import requests
import json
import sys

def delete_message(message_id):
    url = f"http://localhost:8000/api/delete_message/{message_id}/"
    
    try:
        print(f"Sending DELETE request to {url}")
        response = requests.delete(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def get_messages(conversation_id):
    url = f"http://localhost:8000/api/get_messages/{conversation_id}/"
    
    try:
        print(f"Fetching messages for conversation: {conversation_id}")
        response = requests.get(url)
        if response.status_code == 200:
            return response.json().get("messages", [])
        else:
            print(f"Error getting messages. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"Error: {e}")
        return []

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_delete.py <message_id>")
        return
    
    message_id = sys.argv[1]
    
    # First, check if the message exists
    print("Getting conversation messages before deletion...")
    messages = get_messages("test_conv_123")
    
    # Find the message we want to delete
    message_exists = False
    for msg in messages:
        if msg["_id"] == message_id:
            message_exists = True
            print(f"Found message with ID {message_id}: {msg['content']}")
            break
    
    if not message_exists:
        print(f"Message with ID {message_id} not found.")
        return
    
    # Delete the message
    print(f"\nDeleting message {message_id}")
    if delete_message(message_id):
        print("\nMessage deleted successfully!")
        
        # Verify the deletion
        print("\nVerifying deletion...")
        messages = get_messages("test_conv_123")
        
        # Check if the message is still there
        message_exists = False
        for msg in messages:
            if msg["_id"] == message_id:
                message_exists = True
                print(f"Message with ID {message_id} still exists!")
                break
        
        if not message_exists:
            print(f"Confirmed: Message with ID {message_id} has been deleted.")
    else:
        print("\nFailed to delete message.")

if __name__ == "__main__":
    main() 