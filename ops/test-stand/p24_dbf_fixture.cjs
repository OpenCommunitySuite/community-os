// Synthetic single-row P24 DBF, matching BankStatementDbfTests.Create's layout.
module.exports = function p24Dbf({ iban, externalId, amount }) {
  if (!/^UA\d{27}$/.test(iban) || !/^[A-Za-z0-9._-]{1,16}$/.test(externalId) ||
      !Number.isInteger(amount) || amount <= 0 || amount > 999999999) throw new Error('Invalid synthetic DBF fixture');
  const fields = [['TIP', 4], ['N_D', 10], ['DATE', 10], ['SUMMA', 15], ['NAME_A', 140],
    ['COUNT_A', 40], ['MFO_A', 9], ['BANK_A', 45], ['NAME_B', 140], ['COUNT_B', 32],
    ['MFO_B', 9], ['BANK_B', 45], ['N_P', 160], ['VAL', 4], ['OKPO_A', 10],
    ['OKPO_B', 10], ['TIME', 17], ['REF', 16], ['SUM_E', 15]];
  const header = 33 + fields.length * 32;
  const width = 1 + fields.reduce((sum, [, length]) => sum + length, 0);
  const bytes = Buffer.alloc(header + width);
  bytes[0] = 3; bytes[29] = 0xc9; bytes[header - 1] = 0x0d;
  bytes.writeUInt32LE(1, 4); bytes.writeUInt16LE(header, 8); bytes.writeUInt16LE(width, 10);
  bytes.fill(0x20, header);
  const values = { TIP: 'C;R;', DATE: '01.02.2026', SUMMA: `${amount}.00`, COUNT_A: iban, VAL: 'UAH', REF: externalId };
  let offset = 1;
  fields.forEach(([name, length], index) => {
    const descriptor = 32 + index * 32;
    bytes.write(name, descriptor, 'ascii');
    const numeric = name === 'SUMMA' || name === 'SUM_E';
    bytes[descriptor + 11] = numeric ? 0x4e : 0x43;
    bytes[descriptor + 16] = length; bytes[descriptor + 17] = numeric ? 2 : 0;
    bytes.write(values[name] || '', header + offset, length, 'ascii');
    offset += length;
  });
  return bytes;
};
