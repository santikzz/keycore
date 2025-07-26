import requests
import json

def test_license_activation():
   
    body = {
        'key':                  '641B-F8F3-D669-A0B1-D669-A0B1',
        'hwid':                 '0000-test-hwid-0000',
        'product_code':         'shodan-ai-premium'
    }

    response = requests.post('http://localhost:8000/api/license/check', body)

    try:
        json_data = response.json()
        print(json.dumps(json_data, indent=4))
    except json.JSONDecodeError:
        print("Response is not valid JSON:")
        print(response.text)


if __name__ == "__main__":
    test_license_activation()