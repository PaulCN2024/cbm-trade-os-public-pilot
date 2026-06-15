function cleanExact(value) {
  return String(value || "").trim();
}

function cleanName(value) {
  return cleanExact(value).toLowerCase();
}

function firstAvailable(record, keys) {
  for (const key of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, key) && record[key]) {
      return record[key];
    }
  }
  return "";
}

function normalizeExistingRecords(records = []) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.map((record) => ({
    original_record: { ...record },
    code: cleanExact(firstAvailable(record, ["code", "business_code"])),
    email: cleanExact(firstAvailable(record, ["email"])),
    phone: cleanExact(firstAvailable(record, ["phone"])),
    website: cleanExact(firstAvailable(record, ["website"])),
    name: cleanName(firstAvailable(record, ["name", "candidate_name", "customer_name", "company_name"])),
  }));
}

function addReason(reasons, reason, candidateValue, recordValue) {
  if (candidateValue && recordValue && candidateValue === recordValue) {
    reasons.push(reason);
  }
}

function checkDuplicateCodeCandidate(input = {}) {
  const warnings = [];
  const existingRecords = input.existing_records;

  if (!Array.isArray(existingRecords) || existingRecords.length === 0) {
    warnings.push("No existing_records provided. Real database duplicate check is not performed.");
    return {
      has_possible_duplicate: false,
      duplicate_candidates: [],
      warnings,
      needs_human_review: false,
    };
  }

  const candidate = {
    code: cleanExact(input.candidate_code),
    email: cleanExact(input.candidate_email),
    phone: cleanExact(input.candidate_phone),
    website: cleanExact(input.candidate_website),
    name: cleanName(input.candidate_name),
  };

  const duplicateCandidates = normalizeExistingRecords(existingRecords)
    .map((record) => {
      const reasons = [];

      addReason(reasons, "code_match", candidate.code, record.code);
      addReason(reasons, "email_match", candidate.email, record.email);
      addReason(reasons, "phone_match", candidate.phone, record.phone);
      addReason(reasons, "website_match", candidate.website, record.website);
      addReason(reasons, "name_match", candidate.name, record.name);

      return {
        record: record.original_record,
        reasons,
      };
    })
    .filter((candidateRecord) => candidateRecord.reasons.length > 0);

  return {
    has_possible_duplicate: duplicateCandidates.length > 0,
    duplicate_candidates: duplicateCandidates,
    warnings,
    needs_human_review: duplicateCandidates.length > 0,
  };
}

module.exports = {
  checkDuplicateCodeCandidate,
  normalizeExistingRecords,
};
