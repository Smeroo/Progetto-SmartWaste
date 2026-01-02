# Relazione Tecnica - SmartWaste

## Autori e Ruoli
- **Team SmartWaste** - Full-Stack Development
  - Frontend: React, Next.js, Tailwind CSS, Leaflet Maps
  - Backend: Next.js API Routes, Prisma ORM, Autenticazione

## Descrizione del Progetto

SmartWaste è un'applicazione web per la gestione intelligente dei rifiuti che permette ai cittadini di localizzare i punti di raccolta differenziata più vicini e agli operatori di gestirli in modo efficiente. Il sistema fornisce informazioni in tempo reale su orari di apertura, tipologie di rifiuti accettati e permette la segnalazione di problematiche.

## Architettura del Sistema

Il progetto segue un'architettura **Layered (a strati)** con chiara separazione delle responsabilità secondo i principi di clean architecture:

### Struttura delle cartelle

```
src/
├── app/
│   └── api/                    # Controller Layer (HTTP handlers)
│       ├── collection-points/  # Gestione punti di raccolta pubblici
│       ├── spaces/             # Gestione spazi (CRUD completo)
│       ├── reviews/            # Gestione recensioni
│       └── profile/            # Gestione profilo utente
├── services/                   # Service Layer (Business Logic)
│   ├── collectionPointService.ts  # Logica punti di raccolta
│   ├── reviewService.ts           # Logica recensioni
│   └── userService.ts             # Logica utenti
├── lib/
│   ├── prisma.ts              # Repository Layer (Database Access)
│   └── reviewUtils.ts         # Utility per calcolo rating medio
└── auth.ts                    # Configurazione autenticazione
```

### Separazione delle Responsabilità

**Controller Layer** (`src/app/api/**/route.ts`)
- Gestisce le richieste HTTP (Request/Response)
- Valida parametri della richiesta
- Verifica autenticazione e ruoli utente
- Chiama il Service Layer per la business logic
- Gestisce aspetti infrastrutturali (es. file system)
- Restituisce risposte HTTP appropriate

**Service Layer** (`src/services/*.ts`)
- Contiene la business logic dell'applicazione
- Verifica ownership e autorizzazioni a livello di dominio
- Coordina operazioni tra diverse entità
- Chiama il Repository Layer per accesso ai dati
- Solleva eccezioni significative per il dominio

**Repository Layer** (Prisma ORM)
- Astrazione per l'accesso al database
- Query parametrizzate type-safe
- Gestione delle relazioni tra entità
- Transazioni database

### Flusso di una richiesta DELETE

```
Client Request (DELETE /api/spaces/123)
     ↓
[Controller] src/app/api/spaces/[id]/route.ts
  - Estrae e valida l'ID dalla richiesta
  - Verifica autenticazione (session presente)
  - Verifica ruolo utente (AGENCY)
  - Chiama deleteCollectionPoint(id, userId)
  - Gestisce cleanup filesystem (elimina cartella immagini)
  - Restituisce 204 No Content in caso di successo
  - Gestisce errori specifici (404, 403, 500)
     ↓
[Service] src/services/collectionPointService.ts
  - Verifica esistenza della risorsa
  - Verifica ownership (operatorId === userId)
  - Solleva eccezioni specifiche se necessario
  - Chiama Prisma per eliminare la risorsa
     ↓
[Repository] Prisma ORM (src/lib/prisma.ts)
  - Esegue DELETE con query parametrizzata
  - Gestisce cascade delete per relazioni
  - Commit della transazione
```

### Esempio di Codice: Service Layer

```typescript
// src/services/collectionPointService.ts
export async function deleteCollectionPoint(id: number, userId: string) {
  // Verifica ownership
  const collectionPoint = await prisma.collectionPoint.findUnique({
    where: { id },
    select: { operatorId: true },
  });

  if (!collectionPoint) {
    throw new Error('Collection point not found');
  }

  if (collectionPoint.operatorId !== userId) {
    throw new Error('Not authorized to delete this resource');
  }

  // Delete the collection point
  await prisma.collectionPoint.delete({
    where: { id },
  });
}
```

### Esempio di Codice: Controller

```typescript
// src/app/api/spaces/[id]/route.ts
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (session.user.role !== 'AGENCY') {
      return NextResponse.json({ error: "User not authorized" }, { status: 403 });
    }

    const spaceId = parseInt(params.id);
    
    // Delega la business logic al service
    try {
      await deleteCollectionPoint(spaceId, session.user.id);
      
      // Gestione filesystem (infrastruttura, rimane nel controller)
      const folderPath = path.join(process.cwd(), 'public', 'uploads', `collectionPoint${params.id}`);
      await fs.rm(folderPath, { recursive: true, force: true });
      
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      // Gestione errori dal service
      if (error instanceof Error) {
        if (error.message === 'Collection point not found') {
          return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error.message === 'Not authorized to delete this resource') {
          return NextResponse.json({ error: error.message }, { status: 403 });
        }
      }
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
```

## API RESTful

### Principi REST implementati

Il sistema implementa un'API RESTful con i seguenti principi:

| Operazione | Metodo HTTP | Endpoint | Risposta | Autenticazione |
|------------|-------------|----------|----------|----------------|
| Lista punti | GET | `/api/collection-points` | 200 + JSON | No |
| Dettaglio punto | GET | `/api/collection-points/{id}` | 200 + JSON | No |
| Crea punto | POST | `/api/collection-points` | 201 + JSON | Sì (AGENCY) |
| Modifica punto | PUT | `/api/spaces/{id}` | 200 + JSON | Sì (AGENCY, owner) |
| Elimina punto | DELETE | `/api/spaces/{id}` | 204 No Content | Sì (AGENCY, owner) |
| Crea recensione | POST | `/api/reviews` | 201 + JSON | Sì (CLIENT) |
| Elimina recensione | DELETE | `/api/reviews/{id}` | 204 No Content | Sì (CLIENT, owner) |
| Profilo utente | GET | `/api/profile` | 200 + JSON | Sì |
| Aggiorna profilo | PUT | `/api/profile` | 200 + JSON | Sì |
| Elimina account | DELETE | `/api/profile` | 204 No Content | Sì |

### Codici di stato HTTP

Il sistema utilizza appropriatamente i codici di stato HTTP:

- `200 OK` - Operazione riuscita con risposta (GET, PUT con body)
- `201 Created` - Risorsa creata con successo (POST)
- `204 No Content` - Operazione riuscita senza body di risposta (DELETE)
- `400 Bad Request` - Parametri non validi o mancanti
- `401 Unauthorized` - Utente non autenticato (sessione mancante)
- `403 Forbidden` - Utente autenticato ma non autorizzato (ruolo errato o non proprietario)
- `404 Not Found` - Risorsa non trovata
- `500 Internal Server Error` - Errore generico del server

### Idempotenza e Safe Methods

- **Safe methods** (GET): Non modificano lo stato del server, possono essere cachate
- **Idempotent methods** (GET, PUT, DELETE): Chiamate multiple producono lo stesso risultato
- **Non-idempotent methods** (POST): Chiamate multiple creano risorse diverse

## Sicurezza

### Autenticazione

Il sistema implementa autenticazione robusta tramite **Auth.js (NextAuth v5)**:

```typescript
// src/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Verifica credenziali
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        // Verifica password con bcrypt
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        return isValid ? user : null;
      }
    })
  ],
  session: { strategy: "jwt" },
  // ...
});
```

**Caratteristiche:**
- Sessioni basate su JWT (stateless, scalabili)
- Password hashate con **bcrypt** (mai salvate in chiaro)
- Salt rounds configurabili per adattare la sicurezza
- Token di reset password con scadenza
- Protezione contro timing attacks

### Autorizzazione

Il sistema implementa un modello di autorizzazione a due livelli:

**1. Role-Based Access Control (RBAC)**
```typescript
if (session.user.role !== 'AGENCY') {
  return NextResponse.json({ error: "User not authorized" }, { status: 403 });
}
```

Ruoli disponibili:
- `CLIENT` - Cittadini: possono vedere punti, creare recensioni
- `AGENCY` - Operatori: possono gestire punti di raccolta
- `ADMIN` - Amministratori: accesso completo

**2. Resource Ownership Verification**
```typescript
// Nel Service Layer
if (collectionPoint.operatorId !== userId) {
  throw new Error('Not authorized to delete this resource');
}
```

Questo garantisce che un operatore possa modificare/eliminare solo le proprie risorse.

### Prevenzione SQL Injection

Il sistema previene SQL Injection utilizzando **Prisma ORM** che:

1. **Genera query parametrizzate automaticamente**
```typescript
// Sicuro - Prisma usa prepared statements
await prisma.collectionPoint.delete({
  where: { id: spaceId }  // Parametro automaticamente sanitizzato
});
```

2. **Type-safety compile-time**
```typescript
// Errore TypeScript se si passa un tipo errato
await prisma.collectionPoint.findUnique({
  where: { id: "invalid" }  // ❌ TypeScript error: Expected number
});
```

3. **Nessuna concatenazione di stringhe SQL**
```typescript
// ❌ Vulnerabile (mai fatto nel progetto)
db.query(`DELETE FROM collection_points WHERE id = ${userId}`);

// ✅ Sicuro (pattern usato)
await prisma.collectionPoint.delete({ where: { id: userId } });
```

### Cross-Site Scripting (XSS)

**Next.js previene XSS automaticamente:**
- Escape automatico di contenuti in JSX/TSX
- Content Security Policy configurabile
- Sanitizzazione di input nei form con React Hook Form + Zod

**Validazione input lato server:**
```typescript
// Validazione con Zod schema
const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  spaceId: z.number().positive()
});
```

### CORS (Cross-Origin Resource Sharing)

- **Next.js gestisce CORS automaticamente** per same-origin requests
- Non abilitato globalmente per ridurre superficie di attacco
- Le API sono progettate per essere consumate dalla stessa origine
- Configurabile tramite middleware se necessario per API pubbliche

### Rate Limiting e DoS Prevention

**Implementazioni consigliate per produzione:**
- Rate limiting per endpoint di autenticazione
- Throttling su operazioni costose (es. geocoding)
- CAPTCHA per prevenire bot su registrazione

## Tecnologie Utilizzate

### Frontend
- **Next.js 15** - Framework React con App Router
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API Routes integrate
- **TypeScript 5.8** - Type safety e migliore DX
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet** - Mappe interattive OpenStreetMap
- **React Hook Form + Zod** - Gestione form type-safe
- **React Toastify** - Sistema di notifiche

### Backend
- **Next.js API Routes** - RESTful API
- **Prisma ORM 6.5** - Type-safe database queries
  - SQLite (sviluppo)
  - PostgreSQL/MySQL (produzione)
- **Auth.js (NextAuth v5)** - Autenticazione moderna
- **bcrypt** - Hashing password sicuro
- **Nominatim API** - Geocoding e reverse geocoding

### Database Schema

```prisma
// schema.prisma (estratto principale)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  
  reviews   Review[]
  operator  Operator?
}

model CollectionPoint {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  operatorId  String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  operator    Operator      @relation(fields: [operatorId], references: [id])
  address     Address?
  wasteTypes  WasteType[]
  reviews     Review[]
  schedule    Schedule?
}

model Review {
  id        Int      @id @default(autoincrement())
  spaceId   Int
  userId    String
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
  
  space     CollectionPoint @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Relazioni implementate:**
- One-to-One: User ↔ Operator, CollectionPoint ↔ Address
- One-to-Many: Operator → CollectionPoints, User → Reviews
- Many-to-Many: CollectionPoint ↔ WasteType (tramite tabella di join implicita)

**Cascade Delete:**
- Eliminando un CollectionPoint, vengono eliminate tutte le reviews associate
- Garantisce integrità referenziale

## Testing

### Strategia di Testing

**Testing manuale implementato:**
- Test di integrazione end-to-end per flussi utente critici
- Verifica ownership su operazioni CRUD
- Test di autorizzazione per diversi ruoli

**Test automatici consigliati per estensione:**
```typescript
// Esempio di test con Jest e Supertest
describe('DELETE /api/spaces/:id', () => {
  it('should return 401 if not authenticated', async () => {
    const response = await request(app)
      .delete('/api/spaces/1');
    expect(response.status).toBe(401);
  });

  it('should return 403 if not owner', async () => {
    const response = await request(app)
      .delete('/api/spaces/1')
      .set('Cookie', `session=${otherUserToken}`);
    expect(response.status).toBe(403);
  });

  it('should delete space and return 204 if owner', async () => {
    const response = await request(app)
      .delete('/api/spaces/1')
      .set('Cookie', `session=${ownerToken}`);
    expect(response.status).toBe(204);
  });
});
```

## Deployment

### Ambiente di Sviluppo
```bash
npm install
npm run dev
# Prisma migrations
npx prisma migrate dev
npx prisma generate
```

### Ambiente di Produzione

**Vercel (consigliato):**
- Deploy automatico da GitHub
- Edge functions per performance
- Variabili d'ambiente sicure
- PostgreSQL via Vercel Postgres

**Variabili d'ambiente richieste:**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://yourdomain.com"
```

## Performance e Scalabilità

### Ottimizzazioni implementate

1. **Database Queries**
   - Select solo campi necessari
   - Include relations solo quando servono
   - Indici su colonne frequentemente cercate

2. **Caching**
   - Next.js automatic static optimization
   - Caching delle risposte API statiche
   - Memoization di componenti React

3. **Bundle Optimization**
   - Code splitting automatico di Next.js
   - Tree shaking per eliminare codice inutilizzato
   - Lazy loading di componenti pesanti

## Note per la Valutazione

### Punti di forza architetturali

1. **Separazione delle responsabilità**: Controller, Service, Repository chiaramente separati
2. **Type safety end-to-end**: TypeScript + Prisma garantiscono type safety da DB a UI
3. **Sicurezza**: Autenticazione robusta, autorizzazione multi-livello, prevenzione SQL Injection
4. **RESTful API**: Utilizzo corretto di HTTP methods, status codes, idempotenza
5. **Scalabilità**: Architettura stateless con JWT, possibile horizontal scaling
6. **Manutenibilità**: Codice ben organizzato, logica centralizzata nei service

### Possibili estensioni future

- Implementazione di cache Redis per performance
- Rate limiting con middleware dedicato
- Monitoring e logging centralizzato (es. Sentry)
- Testing automatizzato con Jest
- CI/CD pipeline con GitHub Actions
- API versioning per backward compatibility

### Repository

Il codice sorgente è disponibile su GitHub e ispezionabile direttamente. L'architettura implementata segue i principi di clean architecture e rispetta le best practices per applicazioni web moderne.

---

**Progetto realizzato per il corso di Ingegneria del Software**  
*SmartWaste - Gestione Intelligente dei Rifiuti*
