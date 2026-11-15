import copy
import unittest

from opening_reconciliation import reconcile, rehearsal, synthetic_example


class OpeningReconciliationTests(unittest.TestCase):
    def test_opposite_differences_remain_visible(self):
        report = rehearsal()
        rows = {r["id"]: r for r in report["rows"]}
        self.assertEqual(10000, rows["B-debt"]["difference"])
        self.assertEqual(-10000, rows["C-debt"]["difference"])
        self.assertEqual(0, report["totals"]["obligation"]["difference"])
        self.assertEqual("difference", rows["B-debt"]["status"])
        self.assertEqual("difference", rows["C-debt"]["status"])

    def test_date_and_separate_payment(self):
        early, late = rehearsal(), rehearsal(cutoff="2026-11-01")
        self.assertEqual(250000, early["totals"]["obligation"]["explained"])
        self.assertEqual(280000, late["totals"]["obligation"]["explained"])
        self.assertEqual(15000, early["totals"]["unallocated_payment"]["explained"])
        self.assertEqual(-30000, late["rows"][0]["difference"])

    def test_unresolved_rows_do_not_become_zero_or_matched(self):
        rows = {r["id"]: r for r in rehearsal()["rows"]}
        self.assertEqual("ambiguous_account", rows["unknown"]["status"])
        self.assertEqual("missing_basis", rows["balance"]["status"])
        for key in ("unknown", "balance"):
            self.assertIsNone(rows[key]["explained"])
            self.assertIsNone(rows[key]["difference"])
        totals = rehearsal()["totals"]
        self.assertEqual(20000, totals["obligation"]["unresolved_source"])
        self.assertEqual(30000, totals["balance_only"]["unresolved_source"])

    def test_retry_and_corrected_version_preserve_original(self):
        source, facts = synthetic_example()
        before = copy.deepcopy((source, facts))
        first = reconcile(source, facts, "2026-10-31")
        self.assertEqual(first, reconcile(source, facts, "2026-10-31"))
        self.assertEqual(before, (source, facts))
        self.assertEqual(rehearsal(), rehearsal())
        old, corrected = rehearsal(), rehearsal(2)
        for index in (2, 3):
            self.assertEqual(old["rows"][index]["id"], corrected["rows"][index]["id"])
            self.assertEqual("matched", corrected["rows"][index]["status"])
        self.assertEqual(90000, old["rows"][2]["source"])


if __name__ == "__main__":
    unittest.main()
