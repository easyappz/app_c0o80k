from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from api.models import Member


class CookieAuthentication(BaseAuthentication):
    """
    Custom authentication class that reads member_id from HttpOnly cookie 'session_id'
    """

    def authenticate(self, request):
        session_id = request.COOKIES.get('session_id')
        if not session_id:
            return None

        try:
            member_id = int(session_id)
            member = Member.objects.get(id=member_id)
            return (member, None)
        except (ValueError, Member.DoesNotExist):
            raise AuthenticationFailed('Invalid session')
