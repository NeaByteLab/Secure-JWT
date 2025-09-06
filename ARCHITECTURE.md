## 🏗️ Architecture

### 🔄 Complete Data Flow

> This diagram shows the complete JWT workflow from data input to output. The **Sign** process creates encrypted tokens and stores them in cache, while **Verify** operations check cache first for 1,600x performance boost. **Decode** extracts raw data without verification, and **Cache Management** ensures memory efficiency with LRU eviction and TTL expiration.

```mermaid
graph TD
    A[User Data] --> B[Sign Request]
    B --> C[Create Payload]
    C --> D[Multi Algorithm Encryption]
    D --> E[Generate Token]
    E --> F[Store in Cache]
    F --> G[Return Token]
    
    H[Token Verification] --> I{Cache Hit?}
    I -->|Yes| J[Return Cached Data]
    I -->|No| K[Decrypt Token]
    K --> L[Validate Integrity]
    L --> M[Store in Cache]
    M --> N[Return Decoded Data]
    
    O[Token Decode] --> P[Extract Payload]
    P --> Q[Return Raw Data]
    
    R[Cache Management] --> S[LRU Eviction]
    S --> T[TTL Expiration]
    T --> U[Memory Limit 10K]
    
    style A fill:#e1f5fe,color:#000
    style G fill:#c8e6c9,color:#000
    style J fill:#c8e6c9,color:#000
    style N fill:#c8e6c9,color:#000
    style Q fill:#c8e6c9,color:#000
    style I fill:#fff9c4,color:#000
    style F fill:#e8f5e8,color:#000
    style M fill:#e8f5e8,color:#000
    style R fill:#f3e5f5,color:#000
```

---

### 🔐 JWT Encoding Process

> This diagram details the token creation process with **multi-algorithm encryption**. Each token gets a **random IV** for uniqueness, **version-based AAD** for compatibility, and **authentication tags** for tamper detection. The **caching system** stores encrypted tokens for instant retrieval, providing massive performance improvements for repeated verifications.

```mermaid
graph TD
    A[User Data] --> B[Create Payload]
    B --> C[Add Timestamps & Version]
    C --> D[JSON Stringify Payload]
    D --> E[Generate Random IV]
    E --> F[Multi Algorithm Encryption]
    F --> G[Create Token Structure]
    G --> H[Base64 Encode]
    H --> I[Secure JWT Token]
    I --> J[Store in Cache]
    J --> K[LRU Eviction Check]
    K --> L[TTL Expiration]

    M[Secret Key] --> N[Key Preparation]
    N --> F
    O[Random Salt] --> N

    P[Version] --> Q[Additional
    Authenticated Data]
    Q --> F

    F --> R[Authentication Tag]
    R --> G

    S[Cache Hit?] --> T[Return Cached Data]
    S --> U[Decrypt & Cache]
    U --> V[Return Decrypted Data]

    style A fill:#e1f5fe,color:#000
    style I fill:#c8e6c9,color:#000
    style F fill:#fff3e0,color:#000
    style M fill:#fce4ec,color:#000
    style J fill:#e8f5e8,color:#000
    style S fill:#fff9c4,color:#000
```

---

### 🛡️ Security Layers

> This diagram illustrates the security-focused verification process. **Cache validation** provides the first security layer, preventing DoS attacks through performance optimization. **Decryption** uses the secret key and random IV, while **integrity checks** verify authentication tags. The **caching system** acts as both a performance and security feature, ensuring fast and secure token validation.

```mermaid
graph LR
    A[Input Token] --> B[Cache Validation]
    B --> C[Validation Layer]
    C --> D[Decryption Layer]
    D --> E[Integrity Check]
    E --> F[Decoded Data]
    
    B --> G[Cache Hit]
    G --> F
    
    H[Cache Miss] --> C
    C --> I[Store in Cache]
    I --> F

    J[Secret Key] --> D
    K[Random IV] --> D
    L[Version AAD] --> D
    M[Auth Tag] --> E

    style B fill:#e8f5e8,color:#000
    style C fill:#ffebee,color:#000
    style D fill:#fff3e0,color:#000
    style E fill:#f3e5f5,color:#000
    style F fill:#e1f5fe,color:#000
    style G fill:#c8e6c9,color:#000
    style I fill:#fff9c4,color:#000
```
