// Google Apps Script for Daily Habit Tracker
// Deploy this as a web app to handle API requests

// Configuration
const SPREADSHEET_ID = '1JKl_2VFyS55oB_sV39b2yuRinEtCyAERJvRZRQCFD_Q'; // User's actual Sheet ID
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
    
    // Append data to sheet
    const success = appendToSheet(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: success,
      message: success ? 'Data saved successfully' : 'Failed to save data'
    })).setMimeType(ContentService.MimeType.JSON);
    
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
    const callback = params.callback;
    const data = params.data;
    
    if (callback && data) {
      // Handle JSONP request
      const jsonData = JSON.parse(data);
      const success = appendToSheet(jsonData);
      
      const result = {
        success: success,
        message: success ? 'Data saved successfully' : 'Failed to save data'
      };
      
      return ContentService.createTextOutput(`${callback}(${JSON.stringify(result)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Handle regular GET requests
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

// Helper function to append data to the sheet
function appendToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      createSheetWithHeaders();
    }
    
    const rowData = [
      data.userEmail,
      data.userName,
      data.date,
      data.wakeTime,
      data.caffeine,
      data.bowelMovement,
      data.exercise,
      data.headache,
      data.waterIntake,
      data.sleepHours,
      new Date().toISOString() // Timestamp
    ];
    
    sheet.appendRow(rowData);
    return true;
    
  } catch (error) {
    console.error('Error appending to sheet:', error);
    return false;
  }
}

// Helper function to create sheet with headers
function createSheetWithHeaders() {
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
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
}

// Helper function to check if user has already submitted data for today
function checkTodaySubmission(email, date) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the email and date columns
    const emailCol = headers.indexOf('User Email');
    const dateCol = headers.indexOf('Date');
    
    if (emailCol === -1 || dateCol === -1) {
      return null;
    }
    
    // Look for existing entry for today
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailCol] === email && row[dateCol] === date) {
        // Return the data in the expected format
        return {
          userEmail: row[emailCol],
          userName: row[headers.indexOf('User Name')],
          date: row[dateCol],
          wakeTime: row[headers.indexOf('Wake Time')],
          caffeine: row[headers.indexOf('Caffeine')],
          bowelMovement: row[headers.indexOf('Bowel Movement')],
          exercise: row[headers.indexOf('Exercise')],
          headache: row[headers.indexOf('Headache')],
          waterIntake: row[headers.indexOf('Water Intake (glasses)')],
          sleepHours: row[headers.indexOf('Sleep Hours')]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error checking today submission:', error);
    return null;
  }
}

// Helper function to get past data for a user
function getPastData(email) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the email column
    const emailCol = headers.indexOf('User Email');
    
    if (emailCol === -1) {
      return [];
    }
    
    const pastData = [];
    
    // Get all rows for this user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailCol] === email) {
        pastData.push({
          userEmail: row[emailCol],
          userName: row[headers.indexOf('User Name')],
          date: row[headers.indexOf('Date')],
          wakeTime: row[headers.indexOf('Wake Time')],
          caffeine: row[headers.indexOf('Caffeine')],
          bowelMovement: row[headers.indexOf('Bowel Movement')],
          exercise: row[headers.indexOf('Exercise')],
          headache: row[headers.indexOf('Headache')],
          waterIntake: row[headers.indexOf('Water Intake (glasses)')],
          sleepHours: row[headers.indexOf('Sleep Hours')]
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
