package com.unslg.aulavirtual.util;

import java.util.regex.Pattern;

public class ValidationUtils {

    private static final String EMAIL_PATTERN = 
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    
    private static final String PHONE_PATTERN = "^[+]?[0-9]{10,15}$";
    
    private static final Pattern emailPattern = Pattern.compile(EMAIL_PATTERN);
    private static final Pattern phonePattern = Pattern.compile(PHONE_PATTERN);

    public static boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return emailPattern.matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return true; // Phone is optional
        }
        return phonePattern.matcher(phone.replaceAll("\\s+", "")).matches();
    }

    public static boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        return password.length() >= 6 && password.length() <= 40;
    }

    public static boolean isValidUserCode(String userCode) {
        if (userCode == null) {
            return false;
        }
        return userCode.length() >= 3 && userCode.length() <= 20 && userCode.matches("^[a-zA-Z0-9]+$");
    }

    public static boolean isValidUsername(String username) {
        if (username == null) {
            return false;
        }
        return username.length() >= 3 && username.length() <= 50 && username.matches("^[a-zA-Z0-9_]+$");
    }
}
