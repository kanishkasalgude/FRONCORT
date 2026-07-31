# Known Limitations & Future Improvements

## Current Limitations

Based on the current architecture and implementation, the following limitations exist:

1. **In-Memory Token Storage**: The frontend applications store the JWT `accessToken` in memory via `@workspace/api-client`. On a full page reload, the application must perform a blocking network request (`/api/auth/refresh`) to re-establish the session, resulting in a brief loading state.
2. **Simplified Audit Permissions**: Audit logs can currently be generated and viewed without granular permission restrictions beyond standard organizational membership. There is no strict "Auditor" role that restricts regular admins from viewing or managing certain log types.
3. **Digest Service Synchrony**: The AI Digest service processes organizations sequentially in a loop (`for...of`). As the number of active users and organizations grows, this single-threaded execution will become a bottleneck and cause delays in digest generation.
4. **Lack of Rate Limiting**: The authentication endpoints (`/register`, `/login`) do not have rate limiting middleware applied, leaving the system susceptible to brute-force credential stuffing.
5. **No Refresh Token Rotation**: When an access token is refreshed, the existing refresh token is reused. This lacks the security benefits of refresh token rotation (which helps detect token theft).
6. **Missing Distributed Cache**: Tenant isolation relies on PostgreSQL to verify `OrgMembership` on every request. Without a distributed cache like Redis, this adds unnecessary database load for highly active users.
7. **No Object Storage**: Ticket attachments currently expect a URL string, implying attachments must be uploaded and hosted elsewhere. There is no native integration with S3 or similar object storage for direct file uploads.

## Future Improvements

| Improvement | Description | Expected Benefit |
| ----------- | ----------- | ---------------- |
| **Implement Redis Caching** | Cache user sessions and `OrgMembership` validations in Redis. | Significantly reduces PostgreSQL query load on every authenticated request and speeds up response times. |
| **Token Rotation** | Issue a new refresh token and invalidate the old one upon every successful `/refresh` call. | Enhances security by mitigating the risk of stolen long-lived refresh tokens. |
| **API Rate Limiting** | Introduce `express-rate-limit` globally, with aggressive limits on `/auth` routes. | Protects against DDoS attacks and brute-force login attempts. |
| **Message Queue for Digests** | Refactor the Digest Service to push generation tasks to a message queue (e.g., RabbitMQ or AWS SQS) for parallel processing by workers. | Ensures scalable and reliable digest generation regardless of user base size. |
| **S3 Integration** | Add a pre-signed URL generation endpoint for secure, direct-to-S3 file uploads for ticket attachments. | Removes reliance on external hosting and secures internal file sharing. |
