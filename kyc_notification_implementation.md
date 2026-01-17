# KYC Notification Implementation

## Overview
Added support for "KYC Verification" notifications in the admin dashboard. This includes processing the new notification type from the API, adding a dedicated tab in the Notifications page, and including these notifications in the global unread count.

## Changes

### 1. Context Update (`src/contexts/NotificationContext.jsx`)
- **State**: Added `kycNotifications` state.
- **Processing**: Updated `processNotifications` to map `kycNotification` array from the API response to a standardized notification format.
- **Unread Count**: Updated `unreadCount` calculation to include unread KYC notifications.
- **Actions**: Updated `markAsRead` and `clearAll` to handle KYC notifications.
- **Export**: Exposed `kycNotifications` in the context value.

### 2. UI Update (`src/app/[lang]/(dashboard)/(private)/pages/notifications/page.jsx`)
- **Tabs**: Added a new tab "KYC Verification" (Index 3).
- **Tab Count**: Added a badge/chip in the tab header showing the number of KYC notifications.
- **Icon**: Used `VerifiedUserIcon` for KYC notifications.
- **List Rendering**: Updated the list to render KYC notifications, showing "View Vendor" button and vendor avatar/name similar to Chat and Bank notifications.

## Verification
- **Global Badge**: The notification bell in the top header now reflects unread KYC notifications automatically via the updated Context.
- **Tabs**: Users can switch to the KYC Verification tab to view details.
- **Interactions**: "View Vendor" button correctly links to the vendor details page.
