// Regular expressions for detecting sensitive information, refined with additional cases
export const PATTERNS = {
    BLOOD_TYPE: /\b(?:(?:A|B|AB)|O)\s?(?:Positive|Negative)\b/g,
    VISA: /\b4\d{3}(-|\s)?\d{4}\1\d{4}\1\d{4}\b/g,
    MASTERCARD: /\b(?:5[1-5]\d{2}|2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20)))(-|\s)?\d{4}\1\d{4}\1\d{4}\b/g,
    RUPAY: /\b(?:6(?:0|5)\d{2}|8(?:1|2)\d{2}|508\d{1})(-|\s)?\d{4}\1\d{4}\1\d{4}\b/g,
    AMERICAN_EXPRESS: /\b3[47]\d{2}(-|\s)?\d{6}\1\d{5}\b/g,
    DATE_FORMAT1: /\b(?:0?[1-9]|[1-2][0-9]|3[0-1])(\/|-)(?:0?[1-9]|1[0-2])\1\d{2,4}\b/g, // dd/mm/yyyy or dd-mm-yyyy
    DATE_FORMAT2: /\b\d{2,4}(\/|-)(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|[1-2][0-9]|3[0-1])\b/g, // yyyy/mm/dd or yyyy-mm-dd
    DATE_FORMAT3: /\b(?:\d{1,2}(?:st|nd|rd|th)?)\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+(?:\d{4})?\b/g, // 5th Oct, 2020
    DATE_FORMAT4: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(?:\d{1,2}(?:st|nd|rd|th)?)[,\s]+(?:\d{4})?\b/g, // Oct 5th, 2020
    TIME: /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\s?(AM|PM|am|pm)?\b/g,
    EMAIL_ADDRESS: /\b[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,125}[a-zA-Z]{2,63}\b/g,
    URL: /\bhttps?:\/\/[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,6}\/?[^\s]*\b/g,
    DOMAIN_NAME: /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g,
    HTTP_USER_AGENT: /\b(?:Mozilla|Opera|Chrome|Safari|Firefox|MSIE|Trident)\/[\d\.]+\s*(?:\([^)]*\))?\s*(?:;|\s+).*\b/g,
    GENDER: /\b(?:m|male|f|female|transgender)\b/gi,
    MARITAL_STATUS: /\b(?:single|married|divorced|widowed|separated)\b/gi,
    RELIGIOUS_TERM: /\b(Christian|Islam|Hinduism|Buddhism|Judaism|Sikhism|Taoism|Shinto)\b/gi,
    SEXUAL_ORIENTATION:
      /\b(?:heterosexual|straight|homosexual|gay|lesbian|bisexual|bi|pansexual|pan|asexual|ace|demisexual|demi|queer|allosexual|androsexual|aromantic|biromantic|fluid|graysexual|grey-?sexual|gynesexual|homoromantic|heteroromantic|monosexual|multisexual|panromantic|polysexual|sapiosexual|skoliosexual|lgbtq(ia)?(\+)?|mogai|grsm|sexual(\s|-)?orientation|romantic(\s|-)?orientation)\b/g,
    MAC_ADDRESS: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g,
    IP_ADDRESS: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    GIT_REPO: /\b((http|git|ssh|http(s)|file|\/?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?\b/g,
    LOCATION_COORDINATES_DMS_LAT: /\b(?:[1-8]?[0-9]|90)°?\s(?:[0-5]?[0-9])'?\s(?:[0-5]?[0-9](?:\.\d+))"?\s([NS]?)\b/g,
    LOCATION_COORDINATES_DMS_LONG: /b(?:[1]?[0-7]?[0-9]|180)°?\s(?:[0-5]?[0-9])'?\s(?:[0-5]?[0-9](?:\.\d+))"?\s([EW]?)b/g,
    LOCATION_COORDINATES_DDM_LAT: /\b(?:[1-8]?[0-9]|90)°?\s(?:[0-5]?[0-9](?:\.\d+))'?\s([NS]?)\b/g,
    LOCATION_COORDINATES_DDM_LONG: /\b(?:[1]?[0-7]?[0-9]|180)°?\s(?:[0-5]?[0-9](?:\.\d+))'?\s([EW]?)\b/g,
    LOCATION_COORDINATES_DD_LAT: /\b(?:[+-]?(?:[1-8]?[0-9](?:\.\d+)|90(?:\.0+)))\b/g,
    LOCATION_COORDINATES_DD_LONG: /\b(?:[+-]?(?:[1]?[0-7]?[0-9](?:\.\d+)|180(?:\.0+)))\b/g,
    PHONE_NUMBER: /\b(?:\+?\d{2}[\s-]?)?\d{5}[\s-]?\d{5}\b/g,
    IFSC_CODE: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    SWIFT_CODE: /\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
    ICCID_NUMBER: /\b89\d{2}(-|\s)?\d{4}\1\d{4}\1\d{4}\1\d{4}?\b/g,
    IMEI_SV_NUMBER: /\b\d{2}(-|\s)?\d{6}\1\d{6}\1\d{1,2}\b/g,
    VEHICLE_IDENTIFICATION_NUMBER:
      /\b(?:MA1|MA3|MA6|MA7|MAH|MAJ|MAK|MAL|MAN|MAT|MB1|MB8|MBF|MBH|MBJ|MBK|MBL|MBU|MBV|MBX|MBY|MC1|MC2|MC4|MCA|MCB|MCD|MCG|MCL|MD2|MD6|MD7|MDE|MDH|MDT|ME1|ME3|ME4|ME9|MEC|MEE|MEG|MER|MET|MEX|MYH|MZ7|MZB|MZD|M3G|M6F)[A-HJ-NPR-Z0-9]{14}\b/g,
    INDIA_AADHAAR_INDIVIDUAL: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    INDIA_GST_INDIVIDUAL: /\b\d{2}[AAA-ZZZ]{3}(?:A|B|C|F|G|H|L|J|P|T)[A-Z]{1}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g,
    INDIA_PAN_INDIVIDUAL: /\b[AAA-ZZZ]{3}(?:A|B|C|F|G|H|L|J|P|T)[A-Z]{1}[0-9]{4}[A-Z]\b/g,
    INDIA_PASSPORT: /\b[A-Z][1-9]\d\s?\d{4}[1-9]\b/g,
    INDIA_DRIVING_LICENCE: /\b(?:[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[0-9]{7})\b/g,
    SOCIAL_SECURITY_CODE: /\b(?!666|000|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0{4})\\d{4}\b/g,
    UPI_ID: /\b[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}\b/g,
    PIN_ZIP_CODE: /\b[1-9]{1}[0-9]{2}\s?[0-9]{3}\b/g,
    OTP: /\b\d{4,6}\b/g,
  };
