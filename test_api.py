import requests

def test_license_activation():
   
    body = {
        'key':                  '958014525BD77BB49CD518474FB599FB',
        'hwid':                 '0000-test-hwid-0000',
        'product_code':         'shodan-ai-premium'
    }

    response = requests.post('http://localhost:8000/api/license/check', body)

    print("=============================================")
    print(f"Response Status Code: {response.status_code}")
    print(f"Response JSON: {response.text}")
    print("=============================================")


if __name__ == "__main__":
    test_license_activation()