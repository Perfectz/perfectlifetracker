/**
 * frontend/src/utils/iconStubs.ts
 * Stub implementations for @expo/vector-icons to work in web environment
 */
import React from 'react';

// Create stubs for MaterialCommunityIcons
export const MaterialCommunityIcons = {
  // Create a component that renders the appropriate icon or emoji
  // This is a simple implementation that returns an emoji or text character
  name: (iconName: string, { size = 24, color = 'black' } = {}) => {
    // Map of icon names to unicode emoji or characters
    const iconMap: Record<string, string> = {
      'weight-lifter': '🏋️',
      'book-open-variant': '📚',
      'format-list-checks': '✓',
      'account': '👤',
      'cog': '⚙️',
      'home': '🏠',
      'plus': '+',
      'check': '✓',
      'close': '×',
      'eye': '👁️',
      'eye-off': '👁️‍🗨️',
      'arrow-left': '←',
      'arrow-right': '→',
      'calendar': '📅',
      'bell': '🔔',
      'star': '⭐',
      'heart': '❤️',
      'magnify': '🔍',
      // Add more mappings as needed
    };

    // Return the emoji or a default character if not found
    const iconText = iconMap[iconName] || '•';
    
    return React.createElement('span', {
      style: {
        fontSize: `${size}px`,
        color,
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        textAlign: 'center',
        lineHeight: `${size}px`,
      },
    }, iconText);
  }
};

// Export other icon sets as needed
export { MaterialCommunityIcons as Ionicons };
export { MaterialCommunityIcons as MaterialIcons };
export { MaterialCommunityIcons as FontAwesome };
export { MaterialCommunityIcons as Feather }; 