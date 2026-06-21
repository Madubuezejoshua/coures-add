# Firestore Security Rules Setup

This document explains how to deploy the Firestore security rules for your Firebase Document Review Publishing System.

## Overview

The `firestore.rules` file contains comprehensive security rules for your Firebase project, protecting all collections and ensuring proper access control.

## Collections Protected

1. **admin** - Admin user accounts
2. **users** - Regular user accounts (contributors, reviewers, publishers)
3. **generatedIds** - Access IDs for user registration
4. **documents** - Document submissions and reviews
5. **activityLogs** - System activity tracking
6. **payouts** - Payout requests and management

## Deploying the Rules

### Method 1: Firebase Console (Recommended for First-Time Setup)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jonal-project**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy the entire contents of `firestore.rules`
6. Paste it into the rules editor
7. Click **Publish**

### Method 2: Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## Key Security Features

### Role-Based Access Control
- **Admins**: Full access to all collections
- **Contributors**: Can create and manage their own documents
- **Reviewers**: Can review submitted documents
- **Publishers**: Can publish approved documents

### User Protection
- Users can only read their own data
- Admins can read all users
- Suspended users cannot perform most actions
- User status is checked on all operations

### Document Security
- Contributors own their documents
- Reviewers can only access submitted documents
- Publishers can only access approved documents
- Proper status transitions are enforced

### Activity Logging
- All user actions are logged
- Users can read their own logs
- Admins can read all logs
- Logs cannot be modified

### Payout Security
- Users can only see their own payouts
- Only admins can approve/reject payouts
- Payout status transitions are controlled

## Testing the Rules

After deployment, test the rules by:

1. Creating a test user account
2. Trying to access other users' data (should fail)
3. Performing allowed actions (should succeed)
4. Verifying suspended users cannot perform actions

## Important Notes

- **Backup your current rules** before deploying new ones
- Test in a development environment first
- Monitor the Firebase Console for rule violations
- Rules are applied immediately upon deployment

## Troubleshooting

If you encounter permission errors after deployment:

1. Check the Firebase Console logs
2. Verify user authentication tokens
3. Ensure user roles are correctly set in Firestore
4. Confirm the user is not suspended

## Support

For issues with the rules, check:
- Firebase Console > Firestore Database > Rules tab
- Firebase Console > Usage tab for errors
- Browser console for client-side errors
