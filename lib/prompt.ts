export const gmailPrompt = `I need you to convert the following user input, written in natural language (English), into a combination of Gmail search operators. The user input will describe a search query for Gmail, and your task is to interpret the intent and convert it into a valid Gmail query string using Gmail's advanced search operators.

-------------Important------------
"Your output must use these operators and build a correct Gmail query string based on the users natural language description:"
1. from - to specify the senders email address.
2. to - to specify the recipients email address.
3. subject - to search for specific words in the emails subject line.
4. has - to search for emails that have attachments, Google Drive links, Google Docs links, Google Sheets links, YouTube links, Photos (like - has:attachment, has:drive, has:document, has:spreadsheet, has:youtube, has:photo). 
5. is - to filter emails that are important, unread, starred, chat (like - is:important, is:unread, is:starred, is:chat) 
6. in - to search within a specific label or category (like in:inbox, in:spam, in:sent).
7. filename - to find emails with specific attachments.
8. label - to search by Gmail label.
9. OR - Search for emails matching at least one condition e.g.,from:example@gmail.com OR subject:project
10. AND - Implicitly used to combine multiple search terms (it's the default) e.g., from:example@gmail.com subject:project
11. NOT or '-' - Exclude emails that match a condition e.g., from:example@gmail.com -has:attachment
12. newer_than - Search for emails newer than a specific time period, e.g., newer_than:1d
13. older_than - Search for emails older than a specific time period (d, m, y for days, months, years), e.g., older_than:6m
14. before - to search for emails sent before date. Dates should be formatted as YYYY/MM/DD.
15. after - to search for emails sent after or on a particular date. Dates should be formatted as YYYY/MM/DD.
16. older and newer - Search for emails older or newer than a specific date.

-----------Rules------------
1. If the user mentions dates, ensure they are converted into the format YYYY/MM/DD. For relative dates like "yesterday" or "last week," translate them into the appropriate absolute date.
2. If the user specifies terms like "emails with attachments" or "important emails," you must include the corresponding Gmail operator (has:attachment or is:important).
3. If the user mentions keywords like "from," "to," or "subject," those should be interpreted as email fields and converted into the appropriate Gmail operator.
4. If user input doesn't contain enough information to build a specific Gmail query or any part of the user input that cann't be represented into the provided operator, then just simply write that part as is at the end of the Gmail query.
5. If the user input contains any type of code like HTML, script tags, SQL query, styles and more which can be used for web attacks like XSS, Clickjacking, and more; remove or don't consider that type of input.
6. If you don't able to form Gmail query at all because of the invalid user query just return empty string nothing else without giving any reason, that is, why is it invalid and so on?.

------------Most Important Rule to consider------------
Don't include anything other than [operator]:[value] in the final Gmail query result like new line characters, or any other delimiter, except space.
example: Correct way - [operator]:[value] [opertor]:[value] [operator]:[value]
-------------------------------------------------------

--------------------------------------
Assume the user is speaking conversationally, and your job is to correctly interpret phrases like "before March 2023" or "after last Monday" and ensure that they are represented properly in the query.
Examples:
User Input: "Find emails from Alice with attachments sent before June 1st, 2023."
Gmail Query: from:alice has:attachment before:2023/06/01

User Input: "Show unread emails from John after August 15, 2022."
Gmail Query: from:john is:unread after:2022/08/15

User Input: "Find all emails with PDFs from Bob sent to Mary."
Gmail Query: from:bob to:mary filename:pdf

User Input: "Show emails that have attachments and were sent after January 1st, 2021."
Gmail Query: has:attachment after:2021/01/01

User Input: "Emails from customer service in the inbox about invoices."
Gmail Query: from:"customer service" in:inbox subject:invoices

User Input: "Flight tickets"
Gmail Query: Flight tickets
`;
