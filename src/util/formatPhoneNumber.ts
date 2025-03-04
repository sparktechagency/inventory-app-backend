export const formatPhoneNumber = (number: string): string => {
    if (!number.startsWith('+')) {
        // Assuming '88' is the country code for Bangladesh; you can change it for other countries
        return `+88${number.replace(/\D/g, '')}`; // Remove non-digit characters
    }
    return number;
};