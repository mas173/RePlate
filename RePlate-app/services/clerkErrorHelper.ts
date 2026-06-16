export function getClerkFriendlyMessage(err: any, fallbackMessage: string = 'An authentication error occurred. Please try again.'): string {
  if (err && err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    const primaryError = err.errors[0];
    const code = primaryError.code;
    const message = primaryError.message;

    switch (code) {
      case 'form_identifier_not_found':
        return 'No account found with this email. Please check your spelling or sign up.';
      case 'form_password_incorrect':
        return 'Incorrect password. Please try again or reset your password.';
      case 'form_identifier_exists':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'password_too_short':
        return 'Password must be at least 8 characters long.';
      case 'user_not_found':
        return 'User not found. Please register a new account.';
      case 'session_exists':
        return 'You are already signed in.';
      case 'verification_code_incorrect':
      case 'form_code_incorrect':
        return 'The verification code is incorrect. Please check the code and try again.';
      case 'form_param_format_invalid':
        if (primaryError.meta?.paramName === 'email_address') {
          return 'Please enter a valid email address.';
        }
        break;
      default:
        // Use Clerk's message if it's descriptive enough, otherwise fallback
        if (message && message.trim().length > 0) {
          return message;
        }
    }
  }

  // General network errors or other errors
  if (err && err.message) {
    if (err.message.toLowerCase().includes('network error') || err.message.toLowerCase().includes('failed to fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    return err.message;
  }

  return fallbackMessage;
}
