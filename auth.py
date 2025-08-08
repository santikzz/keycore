import requests
import hashlib
import platform
import uuid
import os

class Auth:
    
    # API_URL = "https://skynetaim.pro"
    API_URL = "http://localhost:8000"

    def __init__(self, verify_ssl: bool = True, force_https: bool = True, foce_exit: bool = False):
        self.verify_ssl = verify_ssl
        self.force_https = force_https
        self.foce_exit = foce_exit # force exit on failure
        self.api_url = self.API_URL.rstrip('/')
        self.time_left = 0
        self.time_left_human = ""
        self.is_valid = False
        
        if force_https and not self.API_URL.startswith('https://'):
            raise ValueError("API URL must use HTTPS")
    
    def get_hwid(self) -> str:
        hw_info = f"{platform.system()}-{platform.machine()}-{uuid.getnode()}"
        hwid = hashlib.sha256(hw_info.encode()).hexdigest()
        return hwid
    
    def fail(self) -> None:
        self.is_valid = False
        self.time_left = 0
        self.time_left_human = ""
        if self.foce_exit:
            os._exit(1)

    def auth(self, product_code: str, license_key: str) -> bool:
        try:
            response = requests.post(
                f"{self.API_URL}/api/v1/license/check",
                json={
                    'key': license_key,
                    'hwid': self.get_hwid(),
                    'product_code': product_code,
                    'format': 'json',
                },
                timeout=10,
                verify=self.verify_ssl,  # SSL verification
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('status') == 'active' and not data.get('error'):
                    self.is_valid = True
                    self.time_left = data.get('time_left', 0)
                    self.time_left_human = data.get('human_time_left', '')
                    return True
            
            self.fail()
            return False
            
        except Exception:
            self.fail()
            return False
    
    def isValid(self) -> bool:
        return self.is_valid
    
    def getTimeLeft(self) -> int:
        return self.time_left
    
    def getTimeLeftHuman(self) -> str:
        return self.time_left_human


# ================================================= #
#                  Example usage                    #
# ================================================= #
if __name__ == "__main__":
    
    auth = Auth(verify_ssl=False, force_https=False)
    
    product_code = "shodan-ai-premium"
    license_key = "370D-EE06-91B6-92E2-91B6-92E2"

    # AUTHENTICATE
    if auth.auth(product_code, license_key):
        print("License valid")
        print(f"Time left: {auth.getTimeLeft()} seconds")
        print(f"Human readable: {auth.getTimeLeftHuman()}")
        print(f"Is valid: {auth.isValid()}")
    else:
        print("License invalid")
