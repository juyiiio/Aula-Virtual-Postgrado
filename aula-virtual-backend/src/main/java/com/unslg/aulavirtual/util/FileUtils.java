package com.unslg.aulavirtual.util;

import org.springframework.util.StringUtils;

public class FileUtils {

    public static String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    public static String generateUniqueFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomString = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        
        if (StringUtils.hasText(extension)) {
            return timestamp + "_" + randomString + "." + extension;
        } else {
            return timestamp + "_" + randomString;
        }
    }

    public static boolean isValidFileSize(long fileSize, long maxSize) {
        return fileSize <= maxSize;
    }

    public static String formatFileSize(long size) {
        if (size <= 0) return "0 B";
        
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        
        return String.format("%.1f %s", size / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}
