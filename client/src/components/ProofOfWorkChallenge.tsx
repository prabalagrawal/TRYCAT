import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

export type BotProof = { challengeId: string; nonce: string; solution: string };

type Props = {
  subjectId: string;
  onSolved: (proof: BotProof | null) => void;
};

type Challenge = { challengeId: string; nonce: string; difficulty: number };

async function solveChallenge(challenge: Challenge) {
  const encoder = new TextEncoder();
  const target = "0".repeat(challenge.difficulty);
  for (let solution = 0; solution < 600_000; solution += 1) {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${challenge.challengeId}:${challenge.nonce}:${solution}`));
    const hash = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
    if (hash.startsWith(target)) return String(solution);
    if (solution % 200 === 0) await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
  throw new Error("challenge budget exceeded");
}

export function ProofOfWorkChallenge({ subjectId, onSolved }: Props) {
  const [status, setStatus] = useState<"working" | "ready" | "error">("working");
  const [attempt, setAttempt] = useState(0);
  const onSolvedRef = useRef(onSolved);
  const issue = trpc.botChallenge.issue.useMutation();

  useEffect(() => {
    onSolvedRef.current = onSolved;
  }, [onSolved]);

  useEffect(() => {
    let cancelled = false;
    onSolvedRef.current(null);
    setStatus("working");
    issue.mutate({ subjectId }, {
      onSuccess: async (challenge) => {
        try {
          const solution = await solveChallenge(challenge);
          if (cancelled) return;
          onSolvedRef.current({ challengeId: challenge.challengeId, nonce: challenge.nonce, solution });
          setStatus("ready");
        } catch {
          if (!cancelled) setStatus("error");
        }
      },
      onError: () => {
        if (!cancelled) setStatus("error");
      },
    });
    return () => { cancelled = true; };
  }, [attempt, subjectId]);

  return <div className={`proof-challenge proof-${status}`} role="status" aria-live="polite">
    {status === "working" && <><LoaderCircle size={16} className="proof-spinner" /><span>Securing this form…</span></>}
    {status === "ready" && <><CheckCircle2 size={16} /><span>Form protection confirmed. No external tracker was used.</span></>}
    {status === "error" && <><ShieldCheck size={16} /><span>Form protection could not start.</span><button type="button" onClick={() => setAttempt((value) => value + 1)}><RefreshCw size={14} /> Retry</button></>}
  </div>;
}
