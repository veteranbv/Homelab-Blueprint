# Plan before you buy

A homelab is a tool for learning, household services, experimentation, or all
three. The design should follow the reason it exists.

## Write the first three outcomes

Good outcomes are specific:

- learn Linux administration without risking a work computer;
- protect family photos with a tested off-site restore;
- run Home Assistant without depending on the internet;
- learn virtual networking and infrastructure as code; or
- experiment with a local model without sending private data to a third party.

“Build a rack” is not an outcome. Neither is “run Kubernetes.” Those may become
useful means later.

## Record the constraints

| Constraint | Question to answer |
| --- | --- |
| Budget | What can I spend now, and what monthly power cost is acceptable? |
| Space | Where will the equipment live, and who will hear it? |
| Power | Is the circuit adequate, and what needs a UPS? |
| Heat | Where does the waste heat go in summer? |
| Time | How many evenings per month can I realistically maintain this? |
| Household impact | Which services must keep working when I am away? |
| Recovery | What data cannot be recreated, and how quickly must it return? |

Measure idle power before buying more hardware. A used enterprise server can be
cheap at purchase and expensive every hour afterward.

## Separate lab from utility

An experimental cluster may be allowed to break. DNS, family photos, backups,
and home automation usually are not. Put different reliability expectations on
those systems, even if they initially share one physical host.

## Define “done” for the first phase

A strong first milestone is small:

1. one maintained operating system;
2. one useful service;
3. automatic security updates with a reboot plan;
4. a backup stored on a different failure domain;
5. one successful restore; and
6. monitoring that reaches you when the service or backup fails.

> **Field note:** The most useful upgrades in my own lab were often not new
> servers. They were inventory, recovery checks, and repeatable operations. Once
> the system became legible, expansion became much safer.

Next: [Choose hardware by role](02-hardware.md).
