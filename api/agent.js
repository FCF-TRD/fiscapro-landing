import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';

const client = new Anthropic(); // Uses ANTHROPIC_API_KEY env var automatically

const SYSTEM_PROMPT = `Tu es FiscaPro AI — le meilleur comptable de France. Tu combines 3 casquettes :

🧮 EXPERT-COMPTABLE SENIOR (20 ans terrain, 500+ clients)
- PCG, normes ANC, liasse fiscale, FEC, bilan, compte de resultat
- Ecritures de cloture, provisions, amortissements (lineaire, degressif)
- Tu sais quand une charge est deductible (art. 39 CGI)

🕵️ EX-INSPECTEUR DES IMPOTS (15 ans DGFiP, reconverti conseil)
- CGI par coeur : IS (art. 205+), IR (art. 1+), TVA (art. 256+), CET/CVAE/CFE
- Formulaires : 2065, 2033, 2050-2059, CA3, CA12, DAS2, 2069-RCI
- Ce qui declenche un controle : incoherences, charges anormales, ratio marge vs secteur

⚖️ AVOCAT FISCALISTE SENIOR
- Arbitrage salaire/dividendes au centime pres
- Niches : CIR (30%), CII (20%), JEI, ZFU, CESU (2540€), IP Box (10%)
- Holding, convention tresorerie, integration fiscale, management fees
- Report deficits (en avant illimite, carry-back 1 an)

💡 EXPERTISE TERRAIN :
- Frais repas : 5,35€-20,70€/repas, ~220j = 1500€/an (art. 93 CGI)
- IK bareme max : 10 000 km x 5CV = ~5 000€/an exonere
- Loyer a soi-meme : societe paye loyer marche, micro-foncier 30% abattement
- CESU prefinances : 2 540€/an exoneres (art. L7233-4 Code travail)
- Cheques vacances : ~540€/an exoneres
- Tickets restaurant : part patronale 60% exoneree, 7,18€/titre max
- PEE/PERCO : abondement 3 709€/an exonere charges
- Madelin/PER pour TNS : cotisations retraite deductibles
- Cadeaux clients : TVA recuperable si < 73€ TTC/personne/an
- Amortissement logiciel 12 mois, matos info 3 ans
- Provision clients douteux : deductible des la premiere relance AR
- Don association : reduction IS 60% dans limite 20 000€ ou 0,5% CA
- Credit formation dirigeant : 40h x SMIC = 475€ (double si TPE = 950€)
- Carry-back : recupere IS paye annee precedente (max 1M€)

REGLES :
- Parle comme un pote expert, pas comme un manuel
- Explique pour qu'un lyceen de 15 ans comprenne
- Donne TOUJOURS un exemple chiffre avec les vrais chiffres de la societe
- Cite l'article de loi a chaque affirmation importante
- Quand tu proposes une optimisation, donne le montant exact d'economie
- Utilise des emojis pour structurer
- Reponds en francais

⚠️ Tu n'es PAS inscrit a l'Ordre des experts-comptables. Conseils informatifs uniquement.

Tu as une memoire persistante. Utilise l'outil 'memoriser' pour sauvegarder les infos importantes sur l'entreprise (decisions, preferences, contexte). Utilise 'rappeler' pour les retrouver. Commence chaque conversation en rappelant ce que tu sais avec rappeler({cle:'tout'}).`;

// Tools the agent can use
const tools = [
  {
    name: "simuler_salaire_dividendes",
    description: "Calcule le mix optimal salaire/dividendes pour minimiser charges + impots. Donne le montant net pour le dirigeant.",
    input_schema: {
      type: "object",
      properties: {
        benefice: { type: "number", description: "Benefice avant remuneration en euros" },
        forme: { type: "string", enum: ["SAS", "SASU", "SARL", "EURL"], description: "Forme juridique" },
        capital: { type: "number", description: "Capital social en euros" },
        tranche_ir: { type: "number", description: "Tranche marginale IR du dirigeant en %" },
      },
      required: ["benefice", "forme"]
    }
  },
  {
    name: "calculer_is",
    description: "Calcule l'IS (impot sur les societes) avec les taux reduits PME",
    input_schema: {
      type: "object",
      properties: {
        benefice: { type: "number", description: "Resultat fiscal en euros" },
      },
      required: ["benefice"]
    }
  },
  {
    name: "calculer_economies",
    description: "Liste toutes les optimisations possibles avec montants pour cette societe",
    input_schema: {
      type: "object",
      properties: {
        ca: { type: "number", description: "Chiffre d'affaires HT" },
        depenses: { type: "number", description: "Total depenses HT" },
        remuneration: { type: "number", description: "Remuneration annuelle dirigeant" },
        forme: { type: "string", description: "Forme juridique" },
        regime_tva: { type: "string", description: "Regime TVA" },
        nb_salaries: { type: "number", description: "Nombre de salaries" },
      },
      required: ["ca", "forme"]
    }
  },
  {
    name: "generer_document",
    description: "Genere un document comptable ou juridique (PV AG, lettre relance, attestation, etc.)",
    input_schema: {
      type: "object",
      properties: {
        type_document: { type: "string", enum: ["pv_ag", "lettre_relance", "attestation", "devis", "note_frais", "declaration_tva"], description: "Type de document a generer" },
        donnees: { type: "object", description: "Donnees necessaires pour le document" },
      },
      required: ["type_document"]
    }
  },
  {
    name: "memoriser",
    description: "Sauvegarde une information importante sur l'entreprise pour les prochaines conversations (preferences, decisions, contexte)",
    input_schema: {
      type: "object",
      properties: {
        cle: { type: "string", description: "Categorie (ex: preference, decision, alerte)" },
        valeur: { type: "string", description: "Information a memoriser" },
      },
      required: ["cle", "valeur"]
    }
  },
  {
    name: "rappeler",
    description: "Recupere les informations memorisees precedemment sur cette entreprise",
    input_schema: {
      type: "object",
      properties: {
        cle: { type: "string", description: "Categorie a rappeler (ou 'tout' pour tout voir)" }
      },
      required: ["cle"]
    }
  }
];

// Tool implementations
function simulerSalaireDividendes({ benefice, forme, capital = 1000, tranche_ir = 30 }) {
  const isTNS = ['SARL', 'EURL'].includes(forme);
  const chargesRate = isTNS ? 0.45 : 0.65;
  const divCharges = ['SARL', 'EURL'].includes(forme);
  const seuil10pct = capital * 0.10;

  const scenarios = [];
  for (let pctSalaire = 0; pctSalaire <= 100; pctSalaire += 10) {
    const salaireBrut = benefice * pctSalaire / 100;
    const charges = salaireBrut * chargesRate;
    const salaireNet = salaireBrut - charges * (isTNS ? 0 : 0.22);
    const irSalaire = salaireNet * tranche_ir / 100;
    const beneficeApres = benefice - salaireBrut - charges;
    const is = beneficeApres > 0 ? (beneficeApres <= 42500 ? beneficeApres * 0.15 : 42500 * 0.15 + (beneficeApres - 42500) * 0.25) : 0;
    const dividendes = Math.max(0, beneficeApres - is);
    let taxDiv;
    if (divCharges && dividendes > seuil10pct) {
      taxDiv = seuil10pct * 0.30 + (dividendes - seuil10pct) * 0.45;
    } else {
      taxDiv = dividendes * 0.30;
    }
    const netTotal = salaireNet - irSalaire + dividendes - taxDiv;
    scenarios.push({ pctSalaire, salaireBrut: Math.round(salaireBrut), charges: Math.round(charges), salaireNet: Math.round(salaireNet), dividendes: Math.round(dividendes), is: Math.round(is), taxDiv: Math.round(taxDiv), netTotal: Math.round(netTotal) });
  }
  const best = scenarios.reduce((a, b) => a.netTotal > b.netTotal ? a : b);
  return JSON.stringify({ scenarios, best, conseil: `Mix optimal: ${best.pctSalaire}% salaire / ${100 - best.pctSalaire}% dividendes = ${best.netTotal.toLocaleString('fr-FR')} € net` });
}

function calculerIS({ benefice }) {
  if (benefice <= 0) return JSON.stringify({ is: 0, taux_effectif: 0, detail: "Pas d'IS: resultat negatif ou nul" });
  const tranche15 = Math.min(benefice, 42500);
  const tranche25 = Math.max(0, benefice - 42500);
  const is = tranche15 * 0.15 + tranche25 * 0.25;
  const taux = (is / benefice * 100).toFixed(1);
  return JSON.stringify({ is: Math.round(is), taux_effectif: taux + '%', detail: `${tranche15.toLocaleString('fr-FR')} € x 15% = ${Math.round(tranche15 * 0.15).toLocaleString('fr-FR')} € | ${tranche25.toLocaleString('fr-FR')} € x 25% = ${Math.round(tranche25 * 0.25).toLocaleString('fr-FR')} €` });
}

function calculerEconomies({ ca, depenses = 0, remuneration = 0, forme = 'SAS', regime_tva = 'franchise', nb_salaries = 0 }) {
  const ben = ca - depenses - remuneration;
  const economies = [];
  economies.push({ nom: 'Frais de repas', montant: 1500, detail: '220j x ~7€ deductibles' });
  economies.push({ nom: 'IK bareme fiscal', montant: 5000, detail: '10 000 km x 5CV' });
  economies.push({ nom: 'CESU prefinances', montant: 2540, detail: 'Exonere charges + IR' });
  economies.push({ nom: 'Cheques vacances', montant: 540, detail: 'Part patronale exoneree' });
  economies.push({ nom: 'Credit formation dirigeant', montant: nb_salaries < 10 ? 950 : 475, detail: nb_salaries < 10 ? 'TPE double' : '40h x SMIC' });
  if (ben > 42500) economies.push({ nom: 'Timing depenses avant cloture', montant: Math.round((ben - 42500) * 0.10), detail: 'Rester sous le seuil IS 15%' });
  const total = economies.reduce((s, e) => s + e.montant, 0);
  return JSON.stringify({ economies, total, detail: `${economies.length} leviers identifies = ${total.toLocaleString('fr-FR')} €/an d'economies potentielles` });
}

function genererDocument({ type_document, donnees = {} }) {
  const templates = {
    pv_ag: `PV ASSEMBLEE GENERALE\n${'='.repeat(40)}\nDate: ${new Date().toLocaleDateString('fr-FR')}\nSociete: ${donnees.nom || '[NOM]'}\n\nResolution 1: Approbation des comptes\nCA: ${donnees.ca || '[CA]'} € | Resultat net: ${donnees.resultat || '[RESULTAT]'} €\n\nResolution 2: Affectation du resultat\nReserve legale (5%): ${donnees.resultat ? Math.round(donnees.resultat * 0.05) : '[X]'} €\nReport a nouveau: ${donnees.resultat ? Math.round(donnees.resultat * 0.95) : '[X]'} €`,
    lettre_relance: `LETTRE DE RELANCE\n${'='.repeat(40)}\n[Votre societe]\n[Adresse]\n\nA l'attention de: ${donnees.client || '[CLIENT]'}\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\nObjet: Relance facture n°${donnees.facture || '[NUM]'} — ${donnees.montant || '[MONTANT]'} €\n\nMadame, Monsieur,\n\nSauf erreur de notre part, nous n'avons pas recu le reglement de la facture mentionnee ci-dessus, emise le ${donnees.date || '[DATE]'} pour un montant de ${donnees.montant || '[MONTANT]'} € TTC.\n\nNous vous prions de bien vouloir proceder au reglement sous 8 jours.\n\nA defaut, des penalites de retard seront appliquees (art. L441-10 C. com.) au taux de 3 fois le taux d'interet legal, soit ${donnees.penalites || '12,88'}% annuel.\n\nCordialement,`,
    attestation: `ATTESTATION\n${'='.repeat(40)}\nJe soussigne(e) ${donnees.dirigeant || '[DIRIGEANT]'}, en qualite de ${donnees.qualite || 'President'} de la societe ${donnees.nom || '[NOM]'}, atteste sur l'honneur que ${donnees.objet || '[OBJET]'}.\n\nFait a ${donnees.ville || '[VILLE]'}, le ${new Date().toLocaleDateString('fr-FR')}\n\nSignature:`,
  };
  return JSON.stringify({ document: templates[type_document] || 'Type de document non supporte. Types disponibles: pv_ag, lettre_relance, attestation', type: type_document });
}

// Memory store (Vercel KV with in-memory fallback)
const memoryStore = {};

async function memoriser({ cle, valeur }) {
  try {
    const key = 'fp_memory_' + cle;
    await kv.set(key, valeur);
    // Also maintain an index of all keys
    const index = await kv.get('fp_memory_index') || [];
    if (!index.includes(cle)) { index.push(cle); await kv.set('fp_memory_index', index); }
    return JSON.stringify({ status: 'ok', message: 'Memorise: ' + cle + ' = ' + valeur });
  } catch(e) {
    // Fallback to in-memory if KV not configured
    memoryStore[cle] = valeur;
    return JSON.stringify({ status: 'ok', message: 'Memorise (local): ' + cle + ' = ' + valeur });
  }
}

async function rappeler({ cle }) {
  try {
    if (cle === 'tout') {
      const index = await kv.get('fp_memory_index') || [];
      const all = {};
      for (const k of index) { all[k] = await kv.get('fp_memory_' + k); }
      return JSON.stringify(all);
    }
    const val = await kv.get('fp_memory_' + cle);
    return JSON.stringify({ [cle]: val || 'Rien memorise pour cette cle' });
  } catch(e) {
    return JSON.stringify(memoryStore[cle] ? { [cle]: memoryStore[cle] } : { error: 'KV non configure' });
  }
}

async function executeTool(name, input) {
  switch (name) {
    case 'simuler_salaire_dividendes': return simulerSalaireDividendes(input);
    case 'calculer_is': return calculerIS(input);
    case 'calculer_economies': return calculerEconomies(input);
    case 'generer_document': return genererDocument(input);
    case 'memoriser': return await memoriser(input);
    case 'rappeler': return await rappeler(input);
    default: return JSON.stringify({ error: 'Tool inconnue: ' + name });
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' });

    const systemPrompt = SYSTEM_PROMPT + (context ? '\n\n' + context : '');

    // Agentic loop — let Claude use tools until done
    let currentMessages = messages.map(m => ({ role: m.role, content: m.content }));
    let finalText = '';
    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      iterations++;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages: currentMessages,
      });

      if (response.stop_reason === 'end_turn') {
        for (const block of response.content) {
          if (block.type === 'text') finalText += block.text;
        }
        break;
      }

      if (response.stop_reason === 'tool_use') {
        // Execute all tool calls
        currentMessages.push({ role: 'assistant', content: response.content });

        const toolResults = [];
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const result = await executeTool(block.name, block.input);
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
          }
        }
        currentMessages.push({ role: 'user', content: toolResults });
        continue;
      }

      // Default: extract text
      for (const block of response.content) {
        if (block.type === 'text') finalText += block.text;
      }
      break;
    }

    return res.status(200).json({ answer: finalText });

  } catch (error) {
    console.error('Agent error:', error);
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
}
