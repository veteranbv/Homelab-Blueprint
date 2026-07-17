# Add local AI and an agentic operations harness

Local AI can keep sensitive work close to home, reduce latency, and make idle
hardware useful when the model, retrieval, telemetry, and tools are configured
without external egress. An operations agent can also create real leverage.
Neither is a reason to hand an unbounded model a shell and hope.

## Local inference defaults

- **Ollama:** easiest default for one operator, broad hardware support, and local
  experimentation.
- **llama.cpp:** lower-level portability, tuning, and a minimal OpenAI-compatible
  server across varied hardware.
- **vLLM:** advanced multi-user throughput, batching, accelerator support, and
  API serving.
- **Open WebUI:** optional interface, not the inference layer. Treat imported
  functions as executable code with access to the host and data.

Start with a direct runtime API. Add a provider-neutral gateway only when there
are multiple backends, users, quotas, or cost controls to manage.

## From scripts to an agentic harness

I did not start by giving an AI shell access. I first made the lab legible:
source-of-truth inventory, structured commands, dry runs, health gates, and
recovery paths. The agent came last.

The progression looked like this:

1. Put operational standards and runbooks in version control.
2. Keep credentials external and inject narrowly scoped identities at runtime.
3. Wrap service APIs in one JSON-first CLI with stable success and error shapes.
4. Resolve targets from authoritative inventory instead of remembered addresses.
5. Cross-check inventory against live systems before declaring truth.
6. Separate read-only discovery from mutating tools.
7. Preview consequential work, require approval, then verify the live result.
8. Bracket upgrades with smoke tests, recovery points, rollback gates, and
   convergence checks.
9. Expose the same guarded operations through agent tools.
10. Bound autonomous loops with an objective, iteration limit, durable state,
    and a human stop condition.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/agentic-safety-dark.png">
  <img src="images/agentic-safety.png" alt="Agentic operations safety loop showing observation, source-of-truth reconciliation, planning, policy and approval, narrow execution, verification, and recorded evidence." width="900">
</picture>

## Risk classes

| Tool class | Default behavior |
| --- | --- |
| Bounded, low-sensitivity health read | Available without approval; least privilege and output limits |
| Sensitive or bulk read | Redaction, row/time/cost limits, and approval when exposure warrants it |
| Reversible configuration change | Exact preview, narrow target, explicit confirmation |
| Destructive or physical action | Recovery path, exact confirmation, post-action proof |
| Broad autonomous loop | Bounded objective, maximum iterations, durable audit state, human stop |

Classify tools by data sensitivity and operational cost as well as mutability.
Validate inputs and outputs. Apply least-privilege access, redaction, timeouts,
row limits, and rate limits. Keep an audit trail. Assume retrieved content can
contain hostile instructions. The model proposes; policy and typed tools
constrain what can actually happen.

## Measure value, not activity

Useful outcomes include faster fault isolation, fewer missed backups, consistent
patching, current inventory, safer repetitive changes, and recovery evidence.
Token usage, tool-call counts, and an agent that is “always running” are not
value by themselves.

The aim is not autonomous infrastructure theater. It is a lab that exposes
constrained, inspectable operations so an agent can help and prove the result.

## Primary references

- [Ollama documentation](https://docs.ollama.com/)
- [llama.cpp repository](https://github.com/ggml-org/llama.cpp)
- [vLLM documentation](https://docs.vllm.ai/)
- [Model Context Protocol: tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

Next: [Grow and share responsibly](11-grow-share.md).
