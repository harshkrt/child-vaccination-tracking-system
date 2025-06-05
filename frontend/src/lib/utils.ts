import { format, differenceInMonths, differenceInYears, addMonths, parseISO, isValid } from 'date-fns';
import axios from 'axios'; // Added for type checking in getErrorMessage

// Helper for class names, similar to the 'clsx' or 'classnames' libraries
export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export const formatDate = (dateInput: string | Date | undefined | null, dateFormat: string = 'PPP'): string => {
  if (!dateInput) return 'N/A';
  try {
    const dateObj = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(dateObj)) {
        // Fallback for simple date strings if parseISO fails and it might be like 'MM/DD/YYYY'
        // or if the string is already a somewhat valid format that new Date() can handle.
        const directDate = new Date(dateInput);
        if(isValid(directDate)) return format(directDate, dateFormat);
        console.warn("Invalid date input for formatDate after trying parseISO and new Date():", dateInput);
        return 'Invalid Date';
    }
    return format(dateObj, dateFormat);
  } catch (error) {
    console.error("Error formatting date:", dateInput, error);
    return 'Error Date'; // Or handle more gracefully
  }
};


export const getAge = (dob: string | Date | undefined | null): string => {
    if (!dob) return 'N/A';
    try {
        const birthDate = typeof dob === 'string' ? parseISO(dob) : dob;
         if (!isValid(birthDate)) {
            const directDate = new Date(dob); // Attempt with new Date()
            if(!isValid(directDate)) return 'Invalid DOB';
            return calculateAgeString(directDate);
        }
        return calculateAgeString(birthDate);
    } catch {
        return 'Invalid DOB';
    }
};

function calculateAgeString(birthDate: Date): string {
    const today = new Date();
    let years = differenceInYears(today, birthDate);
    let months = differenceInMonths(today, addMonths(birthDate, years * 12));

    if (months < 0) { // Handles edge case where birthday hasn't occurred this year yet
        years--;
        months = differenceInMonths(today, addMonths(birthDate, years * 12));
    }
    
    let result = '';
    if (years > 0) {
        result += `${years}y `;
    }
    if (months > 0 || years === 0) { // Show months if years is 0 OR if there are any months
        result += `${months}m`;
    }
    if (result.trim() === '') { // e.g. less than a month old
      const days = Math.floor(differenceInMonths(today, birthDate) * 30.4375); // rough days
      return `${days}d old`
    }
    return result.trim();
}


export const getAgeInMonths = (dob: string | Date, comparisonDateInput?: string | Date): number => {
    if (!dob) return 0;
    try {
        const birthDate = typeof dob === 'string' ? parseISO(dob) : dob;
        const comparisonDate = comparisonDateInput 
            ? (typeof comparisonDateInput === 'string' ? parseISO(comparisonDateInput) : comparisonDateInput) 
            : new Date();
        
        if (!isValid(birthDate) || !isValid(comparisonDate)) return 0;

        return differenceInMonths(comparisonDate, birthDate);
    } catch {
        return 0;
    }
};

export const capitalize = (s: string | undefined | null): string => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

interface ApiErrorResponseData {
    msg?: string;
    message?: string;
    error?: string | { message: string }; // Sometimes error is an object itself
    errors?: Array<{ msg: string, param?: string }>; // For express-validator like errors
}

// Simple function to display error messages from API responses
export const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data as ApiErrorResponseData;
      // Handle express-validator type errors array
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map(e => e.msg).join(', ');
      }
      // Standard messages
      if (data.msg) return data.msg;
      if (data.message) return data.message;
      // For errors that might be nested like { error: { message: "..." } }
      if (typeof data.error === 'object' && data.error !== null && 'message' in data.error) {
        return (data.error as { message: string }).message;
      }
      if (typeof data.error === 'string') return data.error;
      // Fallback for other Axios error structures or if message is in HTTP statusText
      return error.response.statusText || 'An unexpected error occurred with the server response.';
    } else if (error.request) {
      // The request was made but no response was received
      return 'Network error: No response from server. Please check your connection.';
    }
  }
  // For non-Axios errors or other types of errors
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred.';
};