import requests
import json
import sys

def update_message(message_id, new_content):
    url = f"http://localhost:8000/api/update_message/{message_id}/"
    data = {
        "content": new_content
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        print(f"Sending PUT request to {url} with data: {data}")
        response = requests.put(url, json=data, headers=headers)
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
        print("Usage: python test_update.py <message_id> [new_content]")
        print("If no new_content is provided, it will default to 'Updated message content'")
        return
    
    message_id = sys.argv[1]
    new_content = sys.argv[2] if len(sys.argv) > 2 else "Updated message content"
    
    # First, print the current message
    print("Getting conversation messages before update...")
    messages = get_messages("test_conv_123")
    
    # Find the message we want to update
    current_message = None
    for msg in messages:
        if msg["_id"] == message_id:
            current_message = msg
            break
    
    if current_message:
        print(f"Current message content: {current_message['content']}")
    else:
        print(f"Message with ID {message_id} not found.")
        return
    
    # Update the message
    print(f"\nUpdating message {message_id} with new content: '{new_content}'")
    if update_message(message_id, new_content):
        print("\nMessage updated successfully!")
        
        # Verify the update
        print("\nVerifying update...")
        messages = get_messages("test_conv_123")
        
        # Find the updated message
        updated_message = None
        for msg in messages:
            if msg["_id"] == message_id:
                updated_message = msg
                break
        
        if updated_message:
            print(f"Updated message content: {updated_message['content']}")
        else:
            print(f"Message with ID {message_id} not found after update.")
    else:
        print("\nFailed to update message.")

if __name__ == "__main__":
    main() 