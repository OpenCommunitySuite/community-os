"""Offline synthetic rehearsal, not a financial import format or production reader."""

import argparse
import json
from datetime import date


def reconcile(source, facts, cutoff):
    """Compare separately typed amounts in integer kopecks at a control date."""
    date.fromisoformat(cutoff)
    rows = []
    for item in source:
        candidates = item["accounts"]
        status = "ambiguous_account" if len(candidates) != 1 else (
            "missing_basis" if item["kind"] == "balance_only" else "compared")
        explained = None
        difference = None
        if status == "compared":
            explained = sum(f["amount"] for f in facts
                            if f["account"] == candidates[0]
                            and f["kind"] == item["kind"] and f["date"] <= cutoff)
            difference = item["amount"] - explained
            status = "matched" if difference == 0 else "difference"
        rows.append({"id": item["id"], "accounts": candidates, "kind": item["kind"],
                     "source": item["amount"], "explained": explained,
                     "difference": difference, "status": status})
    totals = {}
    for kind in sorted({r["kind"] for r in rows}):
        compared = [r for r in rows if r["kind"] == kind and r["explained"] is not None]
        unresolved = [r for r in rows if r["kind"] == kind and r["explained"] is None]
        totals[kind] = {"source_compared": sum(r["source"] for r in compared),
                        "explained": sum(r["explained"] for r in compared),
                        "difference": sum(r["difference"] for r in compared),
                        "unresolved_source": sum(r["source"] for r in unresolved)}
    return {"cutoff": cutoff, "rows": rows, "totals": totals}


def synthetic_example(version=1):
    source = [
        {"id": "A-debt", "accounts": ["A"], "kind": "obligation", "amount": 120000},
        {"id": "A-payment", "accounts": ["A"], "kind": "unallocated_payment", "amount": 15000},
        {"id": "B-debt", "accounts": ["B"], "kind": "obligation", "amount": 90000},
        {"id": "C-debt", "accounts": ["C"], "kind": "obligation", "amount": 40000},
        {"id": "unknown", "accounts": ["D", "E"], "kind": "obligation", "amount": 20000},
        {"id": "balance", "accounts": ["F"], "kind": "balance_only", "amount": 30000},
    ]
    facts = [
        {"account": "A", "kind": "obligation", "date": "2026-10-31", "amount": 120000},
        {"account": "A", "kind": "unallocated_payment", "date": "2026-10-31", "amount": 15000},
        {"account": "A", "kind": "obligation", "date": "2026-11-01", "amount": 30000},
        {"account": "B", "kind": "obligation", "date": "2026-10-31", "amount": 80000},
        {"account": "C", "kind": "obligation", "date": "2026-10-31", "amount": 50000},
    ]
    if version == 2:
        source[2]["amount"] = 80000
        source[3]["amount"] = 50000
    return source, facts


def rehearsal(version=1, cutoff="2026-10-31"):
    source, facts = synthetic_example(version)
    return {"synthetic_only": True, "source_version": version,
            **reconcile(source, facts, cutoff)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", type=int, choices=(1, 2), default=1)
    parser.add_argument("--cutoff", default="2026-10-31")
    args = parser.parse_args()
    print(json.dumps(rehearsal(args.version, args.cutoff), ensure_ascii=False, indent=2))
