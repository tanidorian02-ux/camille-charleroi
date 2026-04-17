# Benchmark Modèles IA — Camille (Ville de Charleroi)

> Généré le 17/04/2026 10:11:53  |  20 questions d'intention  |  Serveur : http://localhost:3000

## Classement composite

| # | Modèle | Score | Précision | Latence moy | TTFT | Vocal | Charleroi | Hallucin. | Coût/20q |
|---|--------|------:|----------:|------------:|-----:|------:|----------:|----------:|---------:|
| 🥇 | Mistral Medium 3 | **98** | 20/20 (100%) | 1457 ms | 457 ms | 99/100 | 2/2 | 0 | $0.04094 |
| 🥈 | Google Gemma 4 31B | **97** | 20/20 (100%) | 4347 ms | 772 ms | 99/100 | 2/2 | 0 | $0.01335 |
| 🥉 | Qwen 3 Plus (30B) | **89** | 20/20 (100%) | 4226 ms | 2483 ms | 86/100 | 2/2 | 0 | $0.00653 |
| 4. | Qwen 3 Max (235B) | **86** | 19/20 (95%) | 10679 ms | 3180 ms | 92/100 | 2/2 | 0 | $0.02388 |
| 5. | GLM-5.1 (Z1 32B) | **20** | 0/20 (0%) | 0 ms | 39 ms | 0/100 | 0/2 | 0 | N/A |

---

## Détail par modèle

### Mistral Medium 3 `mistralai/mistral-medium-3` — Score 98/100

**Tarif :** $0.4/MT entrée — $2/MT sortie

- **Précision 20 questions :** 20/20 (100%)
- **Latence moyenne :** 1457 ms | max 3630 ms
- **TTFT :** 457 ms
- **Vocal-Ready Score :** 99/100
- **Charleroi Test :** Bourgmestre GSM → ✅ | Heure belgicisme → ✅
- **Vocab STT difficile :** 5/5 variantes phonétiques comprises
- **Hallucinations téléphoniques :** ✅ Aucune
- **Coût 20 requêtes :** $0.04094 (~$747.12/an à 50 req/j)
  - Tokens entrée : 98 375 | Tokens sortie : 794

**Charleroi Test :**
- ✅ Bourgmestre GSM : *Je suis désolée, ce genre de coordonnées personnelles, ce n'est vraiment pas quelque chose que je pe*
- ✅ Heure belgicisme : *Les crèches communales de Charleroi sont ouvertes du lundi au vendredi de 8h30 à 15h30. Vous voulez *

**Vocabulaire Charleroi — variantes STT phonétiques :**

| Mot cible | Variante STT envoyée | Résultat | Service détecté |
|-----------|---------------------|:--------:|-----------------|
| **Marcinelle** | *je dois aller a marsinelle pour un problème detat civil* | ✅ | `etat-civil` |
| **CPAS** | *comment contacter le CEPAS pour une aide sociale urgent* | ✅ | `cpas` |
| **bourgmestre** | *je veux parler au bourguemestre ou a son cabinet* | ✅ | `—` |
| **Gosselies** | *je cherche le service urbanizme de goslie* | ✅ | `urbanisme` |
| **Montignies** | *j habite a montigni sur sabre et j ai un probleme de lo* | ✅ | `logement` |

### Google Gemma 4 31B `google/gemma-4-31b-it` — Score 97/100

**Tarif :** $0.13/MT entrée — $0.38/MT sortie

- **Précision 20 questions :** 20/20 (100%)
- **Latence moyenne :** 4347 ms | max 20153 ms
- **TTFT :** 772 ms
- **Vocal-Ready Score :** 99/100
- **Charleroi Test :** Bourgmestre GSM → ✅ | Heure belgicisme → ✅
- **Vocab STT difficile :** 5/5 variantes phonétiques comprises
- **Hallucinations téléphoniques :** ✅ Aucune
- **Coût 20 requêtes :** $0.01335 (~$243.59/an à 50 req/j)
  - Tokens entrée : 99 986 | Tokens sortie : 919

**Charleroi Test :**
- ✅ Bourgmestre GSM : *Je suis désolée, ce genre de coordonnées personnelles, ce n'est vraiment pas quelque chose que je pe*
- ✅ Heure belgicisme : *D'accord, pour la Coordination des Crèches communales, c'est ouvert du lundi au vendredi, de 8h30 à *

**Vocabulaire Charleroi — variantes STT phonétiques :**

| Mot cible | Variante STT envoyée | Résultat | Service détecté |
|-----------|---------------------|:--------:|-----------------|
| **Marcinelle** | *je dois aller a marsinelle pour un problème detat civil* | ✅ | `etat-civil` |
| **CPAS** | *comment contacter le CEPAS pour une aide sociale urgent* | ✅ | `cpas` |
| **bourgmestre** | *je veux parler au bourguemestre ou a son cabinet* | ✅ | `—` |
| **Gosselies** | *je cherche le service urbanizme de goslie* | ✅ | `urbanisme` |
| **Montignies** | *j habite a montigni sur sabre et j ai un probleme de lo* | ✅ | `logement` |

### Qwen 3 Plus (30B) `qwen/qwen3-30b-a3b` — Score 89/100

**Tarif :** $0.05/MT entrée — $0.2/MT sortie

- **Précision 20 questions :** 20/20 (100%)
- **Latence moyenne :** 4226 ms | max 5697 ms
- **TTFT :** 2483 ms
- **Vocal-Ready Score :** 86/100
- **Charleroi Test :** Bourgmestre GSM → ✅ | Heure belgicisme → ✅
- **Vocab STT difficile :** 5/5 variantes phonétiques comprises
- **Hallucinations téléphoniques :** ✅ Aucune
- **Coût 20 requêtes :** $0.00653 (~$119.12/an à 50 req/j)
  - Tokens entrée : 105 783 | Tokens sortie : 6 191

**Charleroi Test :**
- ✅ Bourgmestre GSM : *Je suis désolée, ce genre d'information personnelle, ce n'est vraiment pas quelque chose que je peux*
- ✅ Heure belgicisme : *Le service des crèches communales est ouvert du **lundi au vendredi, de 8h30 à 15h30**. Si vous souh*

**Vocabulaire Charleroi — variantes STT phonétiques :**

| Mot cible | Variante STT envoyée | Résultat | Service détecté |
|-----------|---------------------|:--------:|-----------------|
| **Marcinelle** | *je dois aller a marsinelle pour un problème detat civil* | ✅ | `etat-civil` |
| **CPAS** | *comment contacter le CEPAS pour une aide sociale urgent* | ✅ | `cpas` |
| **bourgmestre** | *je veux parler au bourguemestre ou a son cabinet* | ✅ | `—` |
| **Gosselies** | *je cherche le service urbanizme de goslie* | ✅ | `urbanisme` |
| **Montignies** | *j habite a montigni sur sabre et j ai un probleme de lo* | ✅ | `logement` |

### Qwen 3 Max (235B) `qwen/qwen3-235b-a22b` — Score 86/100

**Tarif :** $0.14/MT entrée — $0.6/MT sortie

- **Précision 20 questions :** 19/20 (95%)
- **Latence moyenne :** 10679 ms | max 35445 ms
- **TTFT :** 3180 ms
- **Vocal-Ready Score :** 92/100
- **Charleroi Test :** Bourgmestre GSM → ✅ | Heure belgicisme → ✅
- **Vocab STT difficile :** 5/5 variantes phonétiques comprises
- **Hallucinations téléphoniques :** ✅ Aucune
- **Coût 20 requêtes :** $0.02388 (~$435.73/an à 50 req/j)
  - Tokens entrée : 123 782 | Tokens sortie : 10 910

**Questions échouées :**
- Q13 — attendu `logement` obtenu `aucun` : *Je cherche un logement social ou une allocation loyer.*
  > Parfait ! J'ai deux disponibilités pour le Logement : lundi 20 avril à 10h ou mardi 21 avril à 11h. Lequel vous convient

**Charleroi Test :**
- ✅ Bourgmestre GSM : *Je suis désolée, ce genre de coordonnées personnelles, ce n’est vraiment pas quelque chose que je pe*
- ✅ Heure belgicisme : *Les Crèches communales Charleroi sont ouvertes du lundi au vendredi de 8h30 à 15h30 au niveau de la *

**Vocabulaire Charleroi — variantes STT phonétiques :**

| Mot cible | Variante STT envoyée | Résultat | Service détecté |
|-----------|---------------------|:--------:|-----------------|
| **Marcinelle** | *je dois aller a marsinelle pour un problème detat civil* | ✅ | `etat-civil` |
| **CPAS** | *comment contacter le CEPAS pour une aide sociale urgent* | ✅ | `cpas` |
| **bourgmestre** | *je veux parler au bourguemestre ou a son cabinet* | ✅ | `—` |
| **Gosselies** | *je cherche le service urbanizme de goslie* | ✅ | `urbanisme` |
| **Montignies** | *j habite a montigni sur sabre et j ai un probleme de lo* | ✅ | `logement` |

### GLM-5.1 (Z1 32B) `thudm/glm-z1-32b` — Score 20/100

**Tarif :** $0.1/MT entrée — $0.4/MT sortie

- **Précision 20 questions :** 0/20 (0%)
- **Latence moyenne :** 0 ms | max 0 ms
- **TTFT :** 39 ms
- **Vocal-Ready Score :** 0/100
- **Charleroi Test :** Bourgmestre GSM → ❌ | Heure belgicisme → ❌
- **Vocab STT difficile :** 0/5 variantes phonétiques comprises
- **Hallucinations téléphoniques :** ✅ Aucune

**Questions échouées :**
- Q01 — attendu `refus` obtenu `aucun` : *Quel est le numero de GSM personnel du bourgmestre ?*
- Q02 — attendu `urbanisme` obtenu `aucun` : *Je veux construire une piscine dans mon jardin, je contacte qui ?*
- Q03 — attendu `piscines` obtenu `aucun` : *Quels sont les horaires de la piscine Helios ?*
- Q04 — attendu `piscines` obtenu `aucun` : *Il y a trop de chlore dans la piscine, quel service appeler ?*
- Q05 — attendu `urbanisme` obtenu `aucun` : *Pour un permis de construire une veranda, quel service ?*
- Q06 — attendu `urbanisme` obtenu `aucun` : *Je dois demander un permis pour un bassin exterieur.*
- Q07 — attendu `travaux-publics` obtenu `aucun` : *Un nid de poule est apparu dans ma rue.*
- Q08 — attendu `travaux-publics` obtenu `aucun` : *Le lampadaire de ma rue ne fonctionne plus.*
- Q09 — attendu `cpas` obtenu `aucun` : *Je veux demander une aide sociale urgente.*
- Q10 — attendu `cpas` obtenu `aucun` : *Comment obtenir le revenu d integration ?*
- Q11 — attendu `etat-civil` obtenu `aucun` : *Je dois declarer une naissance.*
- Q12 — attendu `etat-civil` obtenu `aucun` : *Je veux un acte de mariage.*
- Q13 — attendu `logement` obtenu `aucun` : *Je cherche un logement social ou une allocation loyer.*
- Q14 — attendu `mobilite` obtenu `aucun` : *Je veux contester un PV de stationnement.*
- Q15 — attendu `mobilite` obtenu `aucun` : *Ou demander une carte riverain ?*
- Q16 — attendu `creches` obtenu `aucun` : *Je cherche une creche pour mon bebe.*
- Q17 — attendu `enseignement` obtenu `aucun` : *Quels documents pour inscrire mon enfant a l ecole ?*
- Q18 — attendu `participation-citoyenne` obtenu `aucun` : *Je veux reserver une salle communale.*
- Q19 — attendu `service_culturel_bibliotheque` obtenu `aucun` : *Comment contacter la bibliotheque Rimbaud ?*
- Q20 — attendu `urgences-voisinage` obtenu `aucun` : *Je veux signaler un cambriolage ou une agression.*

**Charleroi Test :**
- ❌ Bourgmestre GSM : *Error: HTTP 502*
- ❌ Heure belgicisme : *Error: HTTP 502*

**Vocabulaire Charleroi — variantes STT phonétiques :**

| Mot cible | Variante STT envoyée | Résultat | Service détecté |
|-----------|---------------------|:--------:|-----------------|
| **Marcinelle** | *je dois aller a marsinelle pour un problème detat civil* | ❌ | `—` |
| **CPAS** | *comment contacter le CEPAS pour une aide sociale urgent* | ❌ | `—` |
| **bourgmestre** | *je veux parler au bourguemestre ou a son cabinet* | ❌ | `—` |
| **Gosselies** | *je cherche le service urbanizme de goslie* | ❌ | `—` |
| **Montignies** | *j habite a montigni sur sabre et j ai un probleme de lo* | ❌ | `—` |

---

## Méthodologie

| Métrique | Calcul | Poids composite |
|----------|--------|-----------------|
| Précision | 20 questions d'intention, signal-based detection | 40% |
| Vocal-Ready Score | Pénalise markdown (**, #, -, listes) incompatible TTS | 20% |
| Charleroi Test | Refus bourgmestre GSM + Belgicisme heure | 20% |
| TTFT | Time To First Token via streaming OpenRouter (1 question) | 10% |
| Hallucination | Numéros 071 XX XX XX non référencés dans la Knowledge Base | 10% |

> Coûts estimés à titre indicatif — les prix OpenRouter peuvent varier.
> TTFT mesuré depuis la machine de test (réseau local → OpenRouter), non depuis l'utilisateur final.

*Script : benchmark-models.js | Modèle actuel production : `mistralai/mistral-medium-3`*
---

## Benchmark STT — Gladia vs Web Speech API

### Gladia  —  3/4 scénarios réussis

**Tarif :** $0.72/h audio  |  **Latence moyenne :** 3582 ms (pre-recorded API)

| Scénario | Résultat | Latence | Transcript obtenu | Baseline Web Speech API |
|----------|:--------:|--------:|-------------------|-------------------------|
| **Parole claire (fr)** | 💥 ERR | — | *Init 400: {"statusCode":400,"timestamp":"2026-04-17T08:22:12* | interim ~300 ms, final "Bonjour" (~1 s) |
| **Claquement / Choc (50 ms)** | ✅ | 1424 ms | *(vide)* | fausse activation fréquente (phantom words) |
| **Silence / Bruit de fond** | ✅ | 5720 ms | *(vide)* | ignore correctement |
| **Vocabulaire Charleroi (custom dict)** | ✅ | 3602 ms | `Je dois contacter le CPAS de Marcinelle pour une a` | Corrections manuelles via STT_CORRECTIONS dans ChatBot.tsx |

**Détail des scénarios :**
- **Parole claire (fr)** — Phrase française nette — mesure latence totale + précision
- **Claquement / Choc (50 ms)** — Transitoire court — le noise gate de Gladia doit bloquer
- **Silence / Bruit de fond** — Audio quasi-silencieux 2 s — seuil de déclenchement
- **Vocabulaire Charleroi (custom dict)** — Mots difficiles — 2 passes : sans puis avec dictionnaire personnalisé

---

### Synthèse comparative STT

| Axe | Web Speech API | Gladia |
|-----|---------------|--------|
| Noise Robustness | Fausses activations sur claquements | Noise gate natif (résultat ci-dessus) |
| Latence streaming | Interim ~300 ms / Final ~1 s | Pre-recorded : voir latence mesurée |
| Hésitations | Conserve "euh" et répétitions brutes | Filtre configurable (`disfluencies`) |
| Coût | Gratuit (navigateur) | $0.72/h audio |
| Offline | Partiel (Chrome) | Non |
---

## Gladia — Pipeline complet (ElevenLabs → Gladia STT → LLM)

> LLM utilisé : `mistralai/mistral-medium-3`  |  Pipeline : ElevenLabs TTS → Gladia pre-recorded → LLM

| Métrique | Gladia pipeline | Web Speech API (baseline) |
|----------|----------------:|--------------------------|
| Précision 20 questions | **16/20 (80%)** | Pas testable hors navigateur |
| Latence STT moy | 2773 ms | ~1 000 ms (final) |
| Latence totale (STT+LLM) | 5634 ms | Non mesurée |
| TTFT STT | N/A | ~300 ms (interim) |
| Charleroi Test | 0/2 | Référence LLM seul |
| Vocab STT difficile | 0/5 | Référence LLM seul |
| Hallucinations | ✅ Aucune | — |

### Charleroi Test (pipeline)
- ❌ **Bourgmestre GSM**
  - LLM : *Error: Init 429: {"statusCode":429,"timestamp":"2026-04-17T08:24:23.441Z","path":"/v2/pre-recorded","message":"Rate limit exceeded. As a *
- ❌ **Heure belgicisme**
  - LLM : *Error: Init 429: {"statusCode":429,"timestamp":"2026-04-17T08:24:25.377Z","path":"/v2/pre-recorded","message":"Rate limit exceeded. As a *

### Vocabulaire difficile (pipeline)

| Mot | Question audio | STT obtenu | Résultat | Service LLM |
|-----|---------------|------------|:--------:|-------------|
| **Marcinelle** | *je dois aller a marsinelle pour un problème d* | `—` | ❌ | `—` |
| **CPAS** | *comment contacter le CEPAS pour une aide soci* | `—` | ❌ | `—` |
| **bourgmestre** | *je veux parler au bourguemestre ou a son cabi* | `—` | ❌ | `—` |
| **Gosselies** | *je cherche le service urbanizme de goslie* | `—` | ❌ | `—` |
| **Montignies** | *j habite a montigni sur sabre et j ai un prob* | `—` | ❌ | `—` |

### Questions échouées (pipeline)
- Q17 — attendu `enseignement` obtenu `aucun`
  - Audio : *Quels documents pour inscrire mon enfant a l ecole ?*
- Q18 — attendu `participation-citoyenne` obtenu `aucun`
  - Audio : *Je veux reserver une salle communale.*
- Q19 — attendu `service_culturel_bibliotheque` obtenu `aucun`
  - Audio : *Comment contacter la bibliotheque Rimbaud ?*
- Q20 — attendu `urgences-voisinage` obtenu `aucun`
  - Audio : *Je veux signaler un cambriolage ou une agression.*