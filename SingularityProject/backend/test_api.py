import requests
import json
import traceback

def test_create_message():
    url = "http://localhost:8000/api/create_message/"
    data = {
        "conversation_id": "test_conv_123",
        "sender": "test_user_456",
        "content": "This is a test message from Python script"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        print(f"Sending POST request to {url} with data: {data}")
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        # Print the first 1000 characters of the response
        print(f"Response (truncated): {response.text[:1000]}")
        
        if response.status_code == 200:
            try:
                return response.json().get("id")
            except json.JSONDecodeError:
                print("Response is not valid JSON")
                return None
        else:
            print(f"Error status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error making request: {e}")
        traceback.print_exc()
        return None

def test_get_messages(conversation_id):
    url = f"http://localhost:8000/api/get_messages/{conversation_id}/"
    
    try:
        print(f"Sending GET request to {url}")
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        # Print the first 1000 characters of the response
        print(f"Response (truncated): {response.text[:1000]}")
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()

def main():
    print("Testing message creation...")
    message_id = test_create_message()
    
    if message_id:
        print(f"\nMessage created with ID: {message_id}")
        print("\nTesting message retrieval...")
        test_get_messages("test_conv_123")
    else:
        print("Failed to create message. Cannot continue testing.")

if __name__ == "__main__":
    main() 