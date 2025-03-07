export const formatPhoneNumber = (phone: string): string => {
    if (!phone.startsWith('+')) {
        // Assuming '88' is the country code for Bangladesh; you can change it for other countries
        return `+88${phone.replace(/\D/g, '')}`; // Remove non-digit characters
    }
    return phone;
};