// Google Apps Script for Daily Habit Tracker
// Deploy this as a web app to handle API requests

// Configuration
const SPREADSHEET_ID = 'YOUR_GOOGLE_SPREADSHEET_ID'; // Replace with your Google Sheet ID
const SHEET_NAME = 'HabitData';

// Main function to handle web requests
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.userEmail || !data.date) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Append data to Google Sheet
    const success = appendToSheet(data);
    
    if (success) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to save data'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Internal server error'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests for checking today's submission and fetching past data
function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action;
    
    if (action === 'checkToday') {
      const email = params.email;
      const date = params.date;
      
      if (!email || !date) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Missing email or date parameter'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const todayData = checkTodaySubmission(email, date);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        exists: todayData !== null,
        data: todayData
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === 'getPastData') {
      const email = params.email;
      
      if (!email) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Missing email parameter'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const pastData = getPastData(email);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: pastData
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Internal server error'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Append data to Google Sheet
function appendToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      createSheetWithHeaders();
    }
    
    const sheetToUse = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Check if entry already exists for this user and date
    const existingRow = findExistingRow(sheetToUse, data.userEmail, data.date);
    
    if (existingRow > 0) {
      // Update existing row
      updateRow(sheetToUse, existingRow, data);
    } else {
      // Append new row
      const rowData = [
        data.userEmail,
        data.userName || data.userEmail,
        data.date,
        data.wakeTime || '',
        data.caffeine || '',
        data.bowelMovement || '',
        data.exercise || '',
        data.headache || '',
        data.waterIntake || 0,
        data.sleepHours || 0,
        new Date().toISOString() // Timestamp
      ];
      
      sheetToUse.appendRow(rowData);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error appending to sheet:', error);
    return false;
  }
}

// Create sheet with headers if it doesn't exist
function createSheetWithHeaders() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    const headers = [
      'User Email',
      'User Name',
      'Date',
      'Wake Time',
      'Caffeine',
      'Bowel Movement',
      'Exercise',
      'Headache',
      'Water Intake (glasses)',
      'Sleep Hours',
      'Timestamp'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('white');
    
    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
  } catch (error) {
    console.error('Error creating sheet:', error);
  }
}

// Find existing row for user and date
function findExistingRow(sheet, email, date) {
  try {
    const data = sheet.getDataRange().getValues();
    const emailCol = 0; // Column A
    const dateCol = 2;  // Column C
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailCol] === email && data[i][dateCol] === date) {
        return i + 1; // Return 1-based row number
      }
    }
    
    return 0; // Not found
  } catch (error) {
    console.error('Error finding existing row:', error);
    return 0;
  }
}

// Update existing row
function updateRow(sheet, rowNum, data) {
  try {
    const rowData = [
      data.userEmail,
      data.userName || data.userEmail,
      data.date,
      data.wakeTime || '',
      data.caffeine || '',
      data.bowelMovement || '',
      data.exercise || '',
      data.headache || '',
      data.waterIntake || 0,
      data.sleepHours || 0,
      new Date().toISOString() // Timestamp
    ];
    
    sheet.getRange(rowNum, 1, 1, rowData.length).setValues([rowData]);
    
  } catch (error) {
    console.error('Error updating row:', error);
  }
}

// Check if user has submitted data for today
function checkTodaySubmission(email, date) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const emailCol = 0; // Column A
    const dateCol = 2;  // Column C
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailCol] === email && data[i][dateCol] === date) {
        // Return the data in the expected format
        return {
          userEmail: data[i][0],
          userName: data[i][1],
          date: data[i][2],
          wakeTime: data[i][3],
          caffeine: data[i][4],
          bowelMovement: data[i][5],
          exercise: data[i][6],
          headache: data[i][7],
          waterIntake: data[i][8],
          sleepHours: data[i][9]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error checking today submission:', error);
    return null;
  }
}

// Get past data for a user
function getPastData(email) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const emailCol = 0; // Column A
    const pastData = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailCol] === email) {
        pastData.push({
          userEmail: data[i][0],
          userName: data[i][1],
          date: data[i][2],
          wakeTime: data[i][3],
          caffeine: data[i][4],
          bowelMovement: data[i][5],
          exercise: data[i][6],
          headache: data[i][7],
          waterIntake: data[i][8],
          sleepHours: data[i][9]
        });
      }
    }
    
    // Sort by date (newest first)
    pastData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return pastData;
    
  } catch (error) {
    console.error('Error getting past data:', error);
    return [];
  }
}

// Utility function to test the setup
function testSetup() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      createSheetWithHeaders();
      console.log('Sheet created successfully');
    } else {
      console.log('Sheet already exists');
    }
    
    console.log('Setup test completed');
    
  } catch (error) {
    console.error('Setup test failed:', error);
  }
}