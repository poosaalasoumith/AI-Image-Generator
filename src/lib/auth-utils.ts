/**
 * Checks if the given email belongs to an authorized user (admin/developer)
 * Authorized users bypass credit deductions and rate limits.
 * @param email - The user's email address from the database
 * @returns boolean
 */
export function isAuthorizedUser(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const authorizedEmailsStr = process.env.AUTHORIZED_USERS || "";
  const authorizedEmails = authorizedEmailsStr
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
    
  return authorizedEmails.includes(email.trim().toLowerCase());
}
