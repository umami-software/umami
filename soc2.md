# HackZero SOC 2 preparation notes

Last inspected: 2026-10-12, America/Los_Angeles (AWS/HackZero collection timestamps are 2026-10-13 UTC).

These are observations and preparation notes for management review, not compliance conclusions or an assertion that controls passed. No approval, signature, risk acceptance, observation-window start, AWS permission change, key rotation, or firewall change was performed.

## AWS access verified

- Account: `662355201631`.
- Local CLI profile: `umami`; AWS CLI version `2.37.12`.
- Caller: `arn:aws:sts::662355201631:assumed-role/AWSReservedSSO_AdministratorAccess_e326ae36900d0fe1/mike`.
- Identity Center instance: `ssoins-7223b3270e003bf7`, primary region `us-east-1`, identity store `d-9067b9e85a`.
- Directory users returned: `mike`, `brian`, `francis`, with their actual primary work emails. All three are members of `Admins`, which is assigned `AdministratorAccess` on this account.
- Root MFA flag: `AccountMFAEnabled=1`; root access-key flag: `AccountAccessKeysPresent=0`. These flags do not prove Identity Center MFA enforcement.
- Google federation was previously prepared as an inactive Google SAML app. It has not been verified as active in this collection session; CLI authentication alone does not establish Google SSO.

## Findings requiring action

### Public database with unrestricted inbound rule

AWS reports `umami-cloud-db` in `us-west-1` as publicly accessible. Its attached security group, `sg-035516ac69ecc6077` in `vpc-01401b57fc6b3abef`, allows inbound `IpProtocol=-1` from `0.0.0.0/0`, in addition to a self-group rule.

This is an observed configuration exposure. No unauthorized connection, compromise, or data loss has been established. HackZero's AC-14 review also flagged this configuration.

Before changing the rule, identify every legitimate application and administrator connection source, including any Vercel workloads, other services, fixed outbound IPs, private networks, and founder VPNs. Prepare a restricted access path and database-port rules, verify application connectivity, and then collect the resulting settings. Do not remove the existing rule blindly and interrupt production.

### Active IAM keys dating from September 2022

AWS returned one active access key for each of these IAM users:

| IAM user | Key creation time (UTC) | Observed managed-policy attachments |
| --- | --- | --- |
| `clickhouse-s3` | 2022-09-22 18:04:09 | No attached managed policies or inline user policies were returned by the inspected IAM user-policy commands. Resource policies and effective access have not been established. |
| `umami-cloud` | 2022-09-07 05:27:10 | `AmazonRoute53FullAccess`, `SecretsManagerReadWrite`, `AmazonSESFullAccess`, `AmazonS3FullAccess` |

Only key metadata was inspected; no secret key values were retrieved. No expiry or current rotation evidence was established. Confirm who owns these users and which current workloads use them before staged replacement or retirement. Verify workloads before disabling an existing key. Review the broad managed-policy attachments against the actual workload needs.

### AWS access ownership and approvals

The shared HackZero access register now contains the complete inspected population of 16 entries: two IAM users, eleven IAM roles, and three Identity Center users. HackZero matched the three people using exact emails returned by AWS. The other thirteen entries remain unclaimed; no human ownership was guessed from role or login names.

Management still needs to identify accountable owners for non-person identities, decide which entries are privileged, and record actual business needs, independent approvers, and approval dates. Existing access was preserved.

### Additional protection and recovery questions

- A cross-region recovery copy for the database has not been verified. This is not a claim that no export or other backup exists.
- `RDSOSMetrics` log groups have 30-day retention in the inspected regions. Determine whether these performance logs belong in the production log-retention scope before selecting a treatment.
- The inspected PostgreSQL CloudWatch log groups have no configured expiry; no finite retention period was asserted for those groups.
- HackZero AC-14 also requests entry-point protection evidence for the domains already in its register. The AWS database evidence does not establish authentication or public-only reasons for those domains.

## Audit-log observations

No configured CloudTrail trails were returned across the seventeen currently enabled regions. The `us-east-1` CloudTrail Lake listing was also empty; Lake was not exhaustively inspected in all regions.

Nevertheless, CloudTrail Event History returned management-event metadata from July 17 and console-login metadata from September. AWS documents Event History as automatic, immutable, and retaining a rolling 90 days of regional management events. The currently signed POL-01 specifies 90 days for security and audit logs. [AWS Event History documentation](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html).

This distinguishes absence of a configured trail from absence of management-event history. It does not establish data-event collection, an archive beyond 90 days, all-region event retrieval, or application-log coverage. Management must review the evidence against the exact requirements before approving OPS-01.

## Database observations

The regional RDS instance inspection returned one instance, `umami-cloud-db`, in `us-west-1`. This inventory is for RDS DB instances, not every possible AWS data-store type.

- Engine: PostgreSQL; status: available.
- Storage encryption: enabled.
- Deletion protection: enabled.
- Multi-AZ: enabled. This is not cross-region replication.
- Automated backup retention: seven days.
- Preferred backup window: `13:25–13:55` UTC.
- Automated backup status: active; the observed restore window covered approximately October 6–13, 2026.
- PostgreSQL logs are exported to CloudWatch; configuration and log-group listings were collected as the AWS RDS subset of OPS-02.

AVAIL-02 still asks for the provider's configuration screen with recent backup evidence, plus verified cross-region copying or an actual dated management risk acceptance. CLI inspection alone was not substituted for its required screenshot, and no risk acceptance was invented.

## Evidence saved through HackZero MCP

Commands ran as independent, read-only provider CLI inspections. HackZero captured the complete output, command, timestamp, exit code, and hash. The local CLI executable is at `C:/Users/mike/AppData/Local/Programs/Amazon/AWSCLIV2/aws.exe`, although this app session's PATH does not include it. JMESPath projections excluded CloudTrail request/response payloads.

| Control | Evidence filed in the draft | Files | Review |
| --- | --- | --- | --- |
| OPS-01 | Retained July management-event metadata; console-login metadata; trail configuration for `us-east-1` and `us-west-1` | 2 | [Audit logging](https://dashboard.hackzero.ai/trust?control=OPS-01) |
| AC-10 | Root MFA/key-presence flags; active IAM access-key metadata and creation dates | 2 | [Cloud admin access](https://dashboard.hackzero.ai/trust?control=AC-10) |
| AC-14 | RDS instance configuration and its attached security-group rules | 1 | [External access restrictions](https://dashboard.hackzero.ai/trust?control=AC-14) |
| AC-05 | Complete IAM user/role listing; selected user-policy and administrator-role policy attachments | 2 | [Least privilege](https://dashboard.hackzero.ai/trust?control=AC-05) |
| OPS-02, `collected` | RDS log-export settings and CloudWatch log-group destinations for `us-west-1` | 1 | [Log coverage](https://dashboard.hackzero.ai/trust?control=OPS-02) |

Eight retained files were submitted. An initial collection returning only `null` was removed from the draft and replaced with a verified non-empty result. HackZero refused the bulk IAM authorization-details command with a credential-value validation message; safe IAM list commands were used instead. The local read of authorization metadata was used to prepare the register, not retyped as an evidence file.

The shared access inventory also contains the three Identity Center users and their observed group-derived administrator assignment. The CLI assignment chain was inspected locally, but that chain is not yet included in the captured AC-05 evidence bundle; the reviewer still requests it.

## Draft risk register

Five scenarios were added, grounded in the observed AWS configuration:

1. An external attacker could access customer data through the public database endpoint.
2. A leaked long-lived IAM key could expose cloud resources or customer information.
3. An AWS regional disruption could interrupt the PostgreSQL database.
4. An accidental administrator change could interrupt the database or supporting AWS services.
5. Misuse of a founder's administrator session could alter customer-data resources or security settings.

All treatments remain open. HackZero populated default likelihood/impact values of 3; these are provisional server defaults, not a management assessment. Owners, ratings, and the actual separation-of-duties answer still require management review. The current firewall and key findings are recorded in the corresponding evidence drafts and risk treatment plans; their remediation ownership and implementation must still be recorded in the actual fix tracker. No finding was marked resolved.

[Review the risk register](https://dashboard.hackzero.ai/trust?control=RISK-01).

## Human decisions and evidence still needed

1. Identify required database connection sources so a safe firewall change can be prepared.
2. Identify owners and current consumers of `clickhouse-s3` and `umami-cloud`; plan staged key replacement or removal.
3. Claim the remaining AWS non-person identities and record real privileged-access business needs and approvals in [People](https://dashboard.hackzero.ai/trust?tab=people).
4. Review the OPS-01 account evidence and map it to the logging, retention, and deletion requirements; approve only after review.
5. Supply the backup configuration screen and verified separate-region recovery evidence or an actual management decision in [AVAIL-02](https://dashboard.hackzero.ai/trust?control=AVAIL-02).
6. Review scope and completeness in [Your Stack](https://dashboard.hackzero.ai/trust?tab=vendors). The current register aggregates AWS as one system; the detailed AWS observations here do not independently settle the production scope.
7. Complete the remaining personal training, confidentiality, policy/code acknowledgments, responsibility-review, and device-reporting tasks through each person's own HackZero workflow.

The Type 2 observation window has not started. These records support readiness work; they are not evidence backdated into an observation period. Outstanding readiness findings must be resolved before the window can start.
