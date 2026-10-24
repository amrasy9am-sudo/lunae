/** Sample batches used to demonstrate the QR trace flow before real production data exists. */
export interface Batch {
  no: string;
  slug: string;
  shade?: string;
  units: number;
  formulated: string;
  manufactured: string;
  qc: string;
  halal: string;
  released: string;
  expiry: string;
  coa: string;
  recall: boolean;
  firstScan?: { at: string; state: string };
}

export const batches: Batch[] = [
  {
    no: "B2405",
    slug: "moonbeam-skin-tint",
    shade: "Madu",
    units: 4800,
    formulated: "2027-03-15",
    manufactured: "2027-05-12",
    qc: "2027-05-19",
    halal: "2027-05-19",
    released: "2027-05-26",
    expiry: "2030-05-01",
    coa: "QC-2405",
    recall: false,
    firstScan: { at: "2027-10-20", state: "Perlis" },
  },
  {
    no: "B2402",
    slug: "eclipse-cushion",
    shade: "Langsat",
    units: 3600,
    formulated: "2027-03-02",
    manufactured: "2027-05-05",
    qc: "2027-05-12",
    halal: "2027-05-13",
    released: "2027-05-20",
    expiry: "2030-05-01",
    coa: "QC-2402",
    recall: false,
  },
  {
    no: "B2411",
    slug: "nightbloom-lip-cheek-tint",
    shade: "Rambutan",
    units: 5200,
    formulated: "2027-03-20",
    manufactured: "2027-05-22",
    qc: "2027-05-28",
    halal: "2027-05-29",
    released: "2027-06-04",
    expiry: "2029-06-01",
    coa: "QC-2411",
    recall: false,
  },
  {
    no: "B2398",
    slug: "tide-setting-mist",
    units: 6000,
    formulated: "2027-02-25",
    manufactured: "2027-04-28",
    qc: "2027-05-06",
    halal: "2027-05-06",
    released: "2027-05-12",
    expiry: "2029-11-01",
    coa: "QC-2398",
    recall: false,
  },
];

export const batchByNo = (no: string) => batches.find((b) => b.no.toLowerCase() === no.toLowerCase());
