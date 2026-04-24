const { v5: uuidv5 } = require('uuid');

// A fixed namespace UUID for NoteVault Firebase UIDs
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function getFirebaseUuid(firebaseUid) {
  if (!firebaseUid) return null;
  // If it's already a valid UUID, return it
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(firebaseUid)) {
    return firebaseUid;
  }
  return uuidv5(firebaseUid, NAMESPACE);
}

module.exports = { getFirebaseUuid };
