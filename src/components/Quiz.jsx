import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";
import { getCurrentPeriodId } from "../utils/periodId";
import { ensureYear, claimMatches } from "../utils/yearGate";

const WEEK_ID = getCurrentPeriodId(2);
const QUESTIONS_PER_ATTEMPT = 5;
const SEEN_KEY = "mutmlsa_quiz_seen";

// Each entry: [question, correct answer, wrong 1, wrong 2, wrong 3]
// Answer order is shuffled every time a quiz starts, so position never gives the answer away.
const QUESTION_POOL = [
  // ---------- HAEMATOLOGY ----------
  ["A 30-year-old woman has Hb 8.5 g/dL, MCV 68 fL, a high RDW and a low serum ferritin. What is the most likely diagnosis?", "Iron deficiency anaemia", "Beta-thalassaemia trait", "Megaloblastic anaemia", "Aplastic anaemia", "A"],
  ["A 55-year-old strict vegan has Hb 7 g/dL, MCV 118 fL, hypersegmented neutrophils and tingling in the feet. Which deficiency is most likely?", "Vitamin B12", "Iron", "Vitamin K", "Vitamin C", "A"],
  ["A child with sickle cell disease has Howell-Jolly bodies on the blood film. What do they most strongly suggest?", "Functional hyposplenism from repeated splenic infarcts", "Lead poisoning with basophilic stippling in marrow cells", "Iron overload from repeated transfusions", "Active falciparum malaria with high parasitaemia", "A"],
  ["A patient given primaquine develops dark urine. A supravital stain shows Heinz bodies and the film has bite cells. What is the likely cause?", "G6PD deficiency", "Hereditary spherocytosis", "Autoimmune haemolytic anaemia", "Aplastic anaemia", "A"],
  ["A well 62-year-old has a lymphocyte count of 80 × 10⁹/L and many smudge cells on the film. What is the most likely diagnosis?", "Chronic lymphocytic leukaemia", "Infectious mononucleosis", "Acute lymphoblastic leukaemia", "Chronic myeloid leukaemia", "A"],
  ["A 6-year-old has a white count of 120 × 10⁹/L. Blasts are TdT and CD10 positive and MPO negative. What is the likely diagnosis?", "B-cell acute lymphoblastic leukaemia", "Acute myeloid leukaemia with Auer rods", "Chronic myeloid leukaemia in chronic phase", "Hairy cell leukaemia with TRAP-positive cells", "A"],
  ["An adult has pancytopenia, 80% blasts with Auer rods in bundles, and DIC. Which translocation is characteristic?", "t(15;17) PML-RARA", "t(9;22) BCR-ABL1", "t(14;18) BCL2-IGH", "t(11;14) CCND1-IGH", "A"],
  ["A 58-year-old has splenomegaly, WBC 150 × 10⁹/L with all stages of granulocytes, basophilia and a low LAP score. Which test confirms the diagnosis?", "BCR-ABL1 by PCR or FISH", "JAK2 V617F only", "Flow cytometry for TdT", "Direct antiglobulin test", "A"],
  ["A patient bleeds after a tooth extraction. The aPTT is prolonged, PT and platelets are normal. Which is the most likely cause?", "Deficiency of an intrinsic pathway factor such as VIII or IX", "Factor VII deficiency, which prolongs the PT", "Immune thrombocytopenia with a low platelet count", "Warfarin overdose, which prolongs the PT and INR", "C"],
  ["A patient with early liver disease and poor diet has an isolated prolonged PT. Which clotting factor falls first because of its short half-life?", "Factor VII", "Factor VIII", "Factor X", "Fibrinogen", "C"],
  ["An analyser reports platelets 40 × 10⁹/L in an asymptomatic patient, but the film shows platelet clumps. What is the best next step?", "Recollect in a sodium citrate tube and correct for dilution", "Transfuse platelets at once to prevent spontaneous bleeding", "Report the count as a critical result to the ward", "Start high-dose steroids for immune thrombocytopenia", "C"],
  ["An analyser gives a low red cell count, very high MCV and high MCHC, and the sample agglutinates at room temperature. What should you do?", "Warm the sample to 37 °C and re-run", "Add more EDTA to the tube to stop the clumping", "Dilute with distilled water and re-run on the analyser", "Report the values as normal without any comment", "A"],
  ["A day-1 jaundiced baby (group A positive) is born to a group O positive mother. The DAT is weakly positive. What is the most likely diagnosis?", "ABO haemolytic disease of the newborn", "Rh haemolytic disease of the newborn", "G6PD deficiency", "Physiological jaundice", "C"],
  ["A child who chews old painted furniture has microcytosis and basophilic stippling. Which test should be requested?", "Blood lead level", "Serum B12", "Haemoglobin electrophoresis", "Direct antiglobulin test", "C"],
  ["A patient on heparin has platelets that fall from 250 to 70 × 10⁹/L after 7 days, and develops a new clot. What is the likely diagnosis?", "Heparin-induced thrombocytopenia", "Immune thrombocytopenia with antiplatelet antibodies", "Hereditary spherocytosis with a membrane defect", "Vitamin K deficiency with a prolonged PT", "E"],
  ["A child with bloody diarrhoea develops anaemia with schistocytes, platelets of 20 × 10⁹/L and a raised creatinine. What is the likely diagnosis?", "Haemolytic uraemic syndrome", "Immune thrombocytopenia", "Aplastic anaemia", "Hereditary spherocytosis", "E"],
  ["A blood film shows target cells and hypochromic microcytes. Serum ferritin is normal and the red cell count is high. What is most likely?", "Beta-thalassaemia trait", "Iron deficiency anaemia", "Anaemia of chronic disease", "Pernicious anaemia", "A"],

  // ---------- CLINICAL CHEMISTRY ----------
  ["A 45-year-old has fasting plasma glucose of 7.8 mmol/L on two separate days. How is this interpreted?", "Meets the criteria for diabetes mellitus", "Normal fasting glucose that needs no follow-up", "Impaired fasting glucose only, not diabetes", "Gestational diabetes mellitus in a non-pregnant adult", "C"],
  ["A patient with DKA has pH 7.28, low pCO₂ and low bicarbonate. What is the acid-base picture?", "Metabolic acidosis with respiratory compensation", "Respiratory acidosis with renal compensation over days", "Metabolic alkalosis from vomiting and volume loss", "Respiratory alkalosis from hyperventilation and anxiety", "C"],
  ["A patient has Na 140, Cl 100 and HCO₃ 10 mmol/L. What is the anion gap and its meaning?", "30 mmol/L, raised", "10 mmol/L, normal", "50 mmol/L, lowered", "−30 mmol/L, raised", "E"],
  ["A pink serum sample gives K⁺ 7.1 mmol/L in an asymptomatic patient with a normal ECG. What is the most likely explanation?", "Haemolysis causing pseudohyperkalaemia; recollect", "True hyperkalaemia needing urgent treatment at once", "Renal tubular acidosis with a persistently high potassium", "Hypoaldosteronism with salt wasting and acidosis", "E"],
  ["A patient has ALT 25 U/L, ALP 600 U/L, GGT 400 U/L and raised conjugated bilirubin. What pattern is this?", "Obstructive (cholestatic) pattern", "Hepatocellular pattern", "Pre-hepatic haemolytic pattern", "Normal pattern", "C"],
  ["Which cardiac marker would still be raised 7–10 days after a myocardial infarction?", "Troponin", "CK-MB", "Myoglobin", "AST", "C"],
  ["A woman has TSH 15 mIU/L, a low free T4 and positive anti-TPO antibodies. What is the diagnosis?", "Hashimoto thyroiditis (primary hypothyroidism)", "Graves disease with suppressed TSH and a raised free T4", "TSH-secreting pituitary adenoma with a raised free T4", "Sick euthyroid syndrome during acute illness", "E"],
  ["A patient has total calcium 1.8 mmol/L and albumin 20 g/L. What is the corrected calcium and its meaning?", "About 2.2 mmol/L, normal", "About 1.4 mmol/L, low", "About 2.6 mmol/L, high", "1.8 mmol/L, low", "E"],
  ["A dehydrated patient has creatinine 250 µmol/L and a disproportionately raised urea. Which cause is most likely?", "Pre-renal azotaemia", "Post-renal obstruction only", "Liver failure", "Glomerulonephritis", "C"],
  ["A patient has total cholesterol 6.2, HDL 1.2 and triglycerides 2.2 mmol/L. What is the Friedewald LDL?", "4.0 mmol/L", "5.0 mmol/L", "3.0 mmol/L", "6.2 mmol/L", "E"],
  ["A patient has raised unconjugated bilirubin, increased urine urobilinogen and no bilirubin in urine. What type of jaundice is this?", "Haemolytic (pre-hepatic)", "Obstructive jaundice from gallstones in the bile duct", "Hepatocellular jaundice from viral hepatitis damage", "Biliary atresia in a newborn baby with pale stools", "C"],
  ["Serum shows K⁺ 9.5 mmol/L, Ca²⁺ 0.8 mmol/L and a very low ALP. What is the most likely cause?", "K₂EDTA contamination from wrong order of draw", "Haemolysis only, with a falsely high potassium result", "Renal failure with a true raised potassium level", "Hyperparathyroidism with high calcium and low phosphate", "E"],
  ["A glucose of 1.2 mmol/L is reported in a well-looking patient. The plain tube stood unspun for 6 hours. What is the likely explanation?", "Glycolysis by blood cells; recollect in a fluoride tube", "Insulinoma causing true hypoglycaemia in the patient", "Adrenal insufficiency causing a true low glucose level", "Liver failure causing impaired glucose release by the liver", "E"],
  ["A patient has Na 128 mmol/L, a low serum osmolality, and is euvolaemic with high urine osmolality. Which condition fits best?", "SIADH", "Diabetes insipidus", "Primary polydipsia", "Addison's disease with hypovolaemia", "E"],
  ["Which result pattern best fits diabetic ketoacidosis?", "High glucose, ketones in urine, low bicarbonate", "Low glucose, ketones in urine, high bicarbonate", "High glucose, no ketones, high bicarbonate", "Normal glucose, glucose in urine, normal pH", "C"],

  // ---------- MICROBIOLOGY ----------
  ["A sputum smear from a patient with night sweats shows red rods on a blue background after Ziehl-Neelsen. How should this be reported?", "Acid-fast bacilli seen; grade the smear and send for Xpert or culture", "Gram-negative bacilli seen, so report as probable enteric infection", "Gram-positive cocci seen, so report as probable staphylococci", "No organisms seen, so report the smear as negative", "A"],
  ["A non-lactose fermenter with swarming growth on blood agar is urease and H₂S positive. What is the organism?", "Proteus mirabilis", "Escherichia coli", "Klebsiella pneumoniae", "Pseudomonas aeruginosa", "C"],
  ["CSF from a child is turbid and the Gram stain shows Gram-negative diplococci. What is the likely organism?", "Neisseria meningitidis", "Streptococcus pneumoniae", "Haemophilus influenzae", "Listeria monocytogenes", "A"],
  ["CSF from an HIV patient shows encapsulated budding yeast on India ink. What is the likely organism?", "Cryptococcus neoformans", "Candida albicans", "Histoplasma capsulatum", "Aspergillus fumigatus", "C"],
  ["During a cholera outbreak, which enrichment medium is best for stool samples?", "Alkaline peptone water", "Selenite F broth", "MacConkey broth", "Thioglycollate broth", "C"],
  ["Gram-positive cocci in clusters, coagulase negative, grow in only one of two blood culture sets from a well patient. What is the most likely interpretation?", "Skin contaminant", "True bacteraemia needing urgent treatment", "Endocarditis", "Laboratory error in Gram stain", "E"],
  ["Beta-haemolytic colonies from a throat swab are catalase negative, bacitracin sensitive and PYR positive. What is the organism?", "Streptococcus pyogenes", "Streptococcus agalactiae", "Enterococcus faecalis", "Staphylococcus aureus", "C"],
  ["A neonate with sepsis grows beta-haemolytic, catalase-negative cocci that are CAMP positive. What is the organism?", "Streptococcus agalactiae", "Streptococcus pyogenes", "Streptococcus pneumoniae", "Staphylococcus aureus", "A"],
  ["Urethral pus shows Gram-negative intracellular diplococci that grow on Thayer-Martin, are oxidase positive and ferment glucose only. What is the organism?", "Neisseria gonorrhoeae", "Moraxella catarrhalis", "Chlamydia trachomatis", "Trichomonas vaginalis", "C"],
  ["A Staphylococcus aureus isolate is resistant to the cefoxitin disk. What does this indicate?", "MRSA, so report resistance to all beta-lactams", "Penicillinase production only, so treat with amoxicillin-clavulanate", "Vancomycin resistance mediated by the vanA gene cluster", "A fully susceptible strain that needs no further testing", "E"],
  ["The indicator tape does not change colour after an autoclave cycle. What should you do?", "Do not use the load; investigate and repeat the cycle", "Use the load because the indicator tape is unreliable", "Use the load but add a label to show doubt", "Use the load for non-sterile bench work only", "F"],
  ["A Mueller-Hinton plate is inoculated with a suspension much heavier than 0.5 McFarland. What is the effect on disk diffusion?", "Smaller zones, so isolates look falsely resistant", "Larger zones, so isolates look falsely susceptible", "No effect on zone size", "Irregular zones only", "E"],
  ["A single Widal test shows TO 1:160 and TH 1:160 in a patient from a typhoid-endemic area. What is the best interpretation?", "Not diagnostic alone; confirm with blood culture or a rising titre", "Diagnostic of typhoid, so start treatment on this result alone", "Rules out typhoid because the titre is not above 1:320", "Indicates typhoid vaccination only, never active infection", "E"],
  ["A sputum Gram stain shows more than 25 neutrophils and fewer than 10 squamous epithelial cells per low-power field. What does this mean?", "Good-quality lower respiratory specimen", "Saliva contamination, so the specimen should be rejected", "Insufficient specimen, so ask the patient to cough again", "Specimen is suitable only for fungal culture requests", "E"],
  ["A colony is oxidase positive, produces a blue-green pigment and a grape-like smell. What is the organism?", "Pseudomonas aeruginosa", "Escherichia coli", "Klebsiella pneumoniae", "Acinetobacter baumannii", "C"],
  ["A heavy growth of lactose-fermenting mucoid colonies is non-motile, indole negative and citrate positive. What is the organism?", "Klebsiella pneumoniae", "Escherichia coli, an indole-positive and motile organism", "Salmonella Typhi, a non-lactose fermenter in the gut", "Shigella sonnei, a non-motile late lactose fermenter", "A"],
  ["A child has a grey membrane in the throat. Albert's stain of a swab shows green rods with blue-black granules. What is the organism?", "Corynebacterium diphtheriae", "Streptococcus pyogenes, seen as chains of cocci", "Bordetella pertussis, seen as tiny Gram-negative rods", "Haemophilus influenzae, seen as small pleomorphic rods", "A"],
  ["A wound swab grows Gram-positive spore-forming rods anaerobically from a deep penetrating wound with muscle necrosis. Which organism is suspected?", "Clostridium perfringens", "Staphylococcus aureus", "Escherichia coli", "Listeria monocytogenes", "A"],

  // ---------- PARASITOLOGY ----------
  ["A thin film shows enlarged red cells with Schüffner's dots and amoeboid trophozoites. Which species is likely?", "Plasmodium vivax or P. ovale", "Plasmodium falciparum with multiple small rings in cells", "Plasmodium malariae with band forms in small red cells", "Plasmodium knowlesi with a 24-hour asexual cycle", "A"],
  ["A stool sample shows a bile-stained golden-brown egg with a thick mamillated shell. What is the parasite?", "Ascaris lumbricoides (fertilised egg)", "Trichuris trichiura, with barrel-shaped plugged eggs", "Hookworm, with a thin-shelled egg and a few cells", "Enterobius vermicularis, with a flat-sided embryonated egg", "C"],
  ["A child has night-time perianal itching. Which specimen is best for diagnosis?", "Perianal cellophane tape swab in the morning", "A single stool sample collected at midday on any day", "A thick blood film taken during a night fever spike", "A midstream urine sample sent for culture the next day", "C"],
  ["Why must stool for hookworm eggs be examined fresh?", "Eggs hatch into larvae that may be mistaken for Strongyloides", "Eggs dissolve quickly in air and cannot be identified later", "Eggs turn into cysts when left standing at room temperature", "Eggs become acid-fast and appear red on a ZN smear", "C"],
  ["A man from Lake Victoria has blood in his urine. Which collection gives the best chance of finding Schistosoma haematobium eggs?", "Terminal urine collected around midday", "First morning urine only, because eggs are shed overnight", "An evening random sample after a heavy meal", "A stool sample processed by the formol-ether method", "A"],
  ["An HIV-positive patient has chronic watery diarrhoea. Modified ZN shows pink-red round oocysts of 4–6 µm. What is the parasite?", "Cryptosporidium", "Giardia lamblia", "Entamoeba histolytica", "Strongyloides stercoralis", "C"],
  ["A night blood film shows sheathed microfilariae whose tail tip is free of nuclei. What is the species?", "Wuchereria bancrofti", "Brugia malayi", "Loa loa", "Onchocerca volvulus", "C"],
  ["Why is CSF examined in a patient with confirmed sleeping sickness?", "To stage the disease and choose treatment", "To diagnose malaria co-infection by examining the fluid", "To culture the parasite on blood agar in the laboratory", "To count platelets and white cells for the full blood count", "C"],
  ["A vaginal wet mount shows pear-shaped organisms with jerky motility. What is the organism?", "Trichomonas vaginalis", "Candida albicans", "Gardnerella vaginalis", "Entamoeba histolytica", "C"],
  ["A thick film shows 40 parasites per 200 white cells. The white count is 8000/µL. What is the parasite density?", "1,600 parasites/µL", "3,200 parasites/µL", "200 parasites/µL", "40,000 parasites/µL", "A"],
  ["A spleen aspirate shows amastigotes with a kinetoplast inside macrophages. What is the organism?", "Leishmania donovani", "Plasmodium vivax", "Toxoplasma gondii", "Histoplasma capsulatum", "C"],
  ["Skin snips from a patient living near a fast-flowing river show unsheathed microfilariae. What is the parasite?", "Onchocerca volvulus", "Loa loa", "Wuchereria bancrofti", "Mansonella perstans", "C"],
  ["A film shows a banana-shaped gametocyte in a red cell. Which species is this?", "Plasmodium falciparum", "Plasmodium vivax", "Plasmodium malariae", "Plasmodium ovale", "C"],
  ["A stool smear shows cysts with four nuclei and chromatoidal bars with blunt ends. What is the likely organism?", "Entamoeba histolytica or E. dispar", "Giardia lamblia, with pear-shaped trophozoites in stool", "Endolimax nana, a harmless amoeba with small cysts", "Cryptosporidium parvum, with acid-fast oocysts in stool", "A"],
  ["A fresh stool shows oval, thin-shelled colourless eggs with 4–8 cells separated from the shell by a clear space. Which parasite is this?", "Hookworm", "Trichuris trichiura", "Schistosoma mansoni", "Taenia species", "C"],

  // ---------- IMMUNOLOGY & SEROLOGY ----------
  ["In an HIV rapid test algorithm, the first test is reactive but the second is non-reactive. What should be done next?", "Run a tie-breaker test according to the national algorithm", "Report the sample as HIV positive on the first test alone", "Report the sample as HIV negative after the second test", "Discard the sample and ask for a fresh venepuncture", "A"],
  ["A patient has HBsAg positive for more than six months and anti-HBc IgM negative. What is the interpretation?", "Chronic hepatitis B infection", "Acute hepatitis B infection", "Immunity after vaccination", "Past resolved infection", "C"],
  ["A patient is HBsAg negative, anti-HBs positive and anti-HBc negative. What does this show?", "Immunity from vaccination", "Chronic hepatitis B infection with ongoing replication", "Acute hepatitis B infection in the window period", "Occult hepatitis B infection with undetectable surface antigen", "C"],
  ["A very high-titre serum gives a negative latex agglutination test, but a positive result after dilution. What explains this?", "Prozone effect from antibody excess", "Postzone effect from antigen excess", "Cross-reactivity", "Contaminated reagent", "E"],
  ["A pregnant woman with lupus has a positive RPR and a negative TPHA. What is the best interpretation?", "Biological false-positive of the non-treponemal test", "Primary syphilis needing urgent injection of penicillin", "Treated syphilis with a persistent serological scar", "Congenital syphilis in the newborn of this mother", "E"],
  ["A woman with a facial rash and joint pain has a homogeneous ANA pattern and positive anti-dsDNA. What is the likely diagnosis?", "Systemic lupus erythematosus", "Rheumatoid arthritis with a high RF and anti-CCP", "Sjögren syndrome with anti-Ro and anti-La antibodies", "Dermatomyositis with anti-Jo-1 antibodies and muscle weakness", "E"],
  ["What is the usual Mantoux induration threshold for a positive result in an HIV-positive person?", "5 mm", "10 mm", "15 mm", "20 mm", "C"],
  ["An ELISA shows strong colour in every well, including the negative control. What is the most likely cause?", "Insufficient washing or contaminated conjugate", "Conjugate was left out of the assay by mistake", "Serum was too dilute to give a signal in the wells", "Substrate was left out of the colour development step", "A"],
  ["A lateral flow cryptococcal antigen test is positive in an HIV patient with CD4 below 100. What does this mean?", "Cryptococcal antigenaemia needing further evaluation, including lumbar puncture", "Past infection only, so no further action is needed", "A normal finding in an immunosuppressed patient on ART", "Tuberculous meningitis, confirmed by this antigen result", "E"],
  ["A patient is HBsAg positive and HBeAg positive. What does this suggest?", "High viral replication and high infectivity", "Vaccine-induced immunity with no active infection present", "Past resolved infection with full immunity afterwards", "Hepatitis A infection acquired from contaminated food", "C"],
  ["A patient has a positive rheumatoid factor, but the clinician wants a more specific test for rheumatoid arthritis. Which should be requested?", "Anti-CCP antibodies", "ANA", "Anti-dsDNA", "Anti-mitochondrial antibodies", "C"],

  // ---------- BLOOD BANKING ----------
  ["Forward group shows anti-A positive and anti-B negative. Reverse grouping agglutinates both B cells and A1 cells. What is the likely cause?", "A2 subgroup with anti-A1 antibody", "Group O, because both forward reactions would be negative", "Group AB, because the reverse group would be negative", "Rouleaux only, which is removed by saline replacement", "E"],
  ["A standard 300 µg dose of anti-D immunoglobulin covers about how much fetal bleed?", "About 30 mL of fetal whole blood", "About 5 mL of fetal whole blood, and no more than that", "About 100 mL of fetal whole blood, enough for any bleed", "Any amount of fetal bleed, with no upper limit", "E"],
  ["A crossmatch is incompatible only at the antiglobulin phase, and the antibody screen is positive. What is the next step?", "Identify the antibody with a panel; it is likely a clinically significant IgG alloantibody", "Issue the unit anyway because the crossmatch is only weakly positive", "Repeat the ABO group only and then issue the unit", "Discard the sample and report the crossmatch as normal", "E"],
  ["During a transfusion, a patient develops fever, back pain and red urine. What is the first action?", "Stop the transfusion, keep the line open with saline, recheck identity and notify the blood bank", "Slow the transfusion and give paracetamol for the fever", "Continue the transfusion and observe the patient closely", "Switch to another unit of the same group and carry on", "C"],
  ["A unit of platelets was stored at 4 °C overnight. What is the consequence?", "Platelets lose viability and are cleared faster after transfusion", "No effect on the platelets since they tolerate the cold well", "Red cells haemolyse in the unit during cold storage", "Plasma in the unit clots and forms visible strands", "C"],
  ["A female blood donor has a haemoglobin below the minimum threshold. What should be done?", "Defer temporarily and advise on iron", "Accept the donation because the donor looks healthy today", "Accept the donation but only for platelet apheresis", "Accept the donation after she drinks plenty of water", "F"],
  ["A woman of childbearing age needs red cells urgently and her blood group is not yet known. Which red cells should be issued?", "Group O Rh-negative", "Group AB Rh-positive", "Group A Rh-negative", "Group O Rh-positive", "F"],
  ["A group O Rh-negative mother delivers an Rh-positive baby. Which test estimates the dose of anti-D needed?", "Kleihauer-Betke test", "Direct antiglobulin test", "Antibody screen only", "Sickle solubility test", "C"],

  // ---------- HISTOLOGY & CYTOLOGY ----------
  ["What is the recommended volume ratio of fixative to tissue for routine fixation?", "At least 10:1", "At least 1:1, using a small tight container", "At least 2:1, using a shallow tray with a loose lid", "At least 1:10, using a very small volume of fixative", "F"],
  ["Which decalcifier best preserves antigens and DNA for immunohistochemistry on bone?", "EDTA", "Concentrated nitric acid", "Concentrated hydrochloric acid", "Picric acid", "C"],
  ["A liver biopsy is suspected of iron overload. Which stain should be used?", "Perls' Prussian blue", "Congo red", "Periodic acid-Schiff", "Masson's trichrome", "F"],
  ["A kidney biopsy is suspected of amyloidosis. Which stain gives apple-green birefringence under polarised light?", "Congo red", "Perls' Prussian blue", "Sudan black", "Giemsa", "C"],
  ["Tissue sections keep detaching from the slides during staining. Which fix is most appropriate?", "Use adhesive-coated slides such as poly-L-lysine", "Use thicker sections so that they hold on the glass better", "Shorten the fixation time to stop the tissue shrinking", "Skip the dewaxing step so the wax holds the section", "E"],
  ["Holes and vacuoles appear in a frozen section. What is the most likely cause?", "Slow freezing causing ice crystals", "Over-fixation in formalin hardening the tissue too much", "A blunt knife on the cryostat tearing the section", "The wrong stain used for frozen sections of this tissue", "E"],
  ["Air-dried FNAC smears are usually stained with which method?", "May-Grünwald Giemsa or Diff-Quik", "Papanicolaou stain, which is used for wet-fixed smears", "Ziehl-Neelsen stain, which is used for acid-fast bacilli", "Gram stain, which is used for bacteria in smears", "C"],
  ["Haematoxylin and eosin sections look pale with washed-out nuclei. Which is a likely cause?", "Over-differentiation in acid alcohol", "Insufficient fixation time only, with normal staining times", "Sections cut too thick, giving dark nuclei overall", "Excess xylene carried over from the previous change", "E"],
  ["A Pap smear shows cells with perinuclear halos and enlarged irregular nuclei. Which infection is suggested?", "Human papillomavirus", "Candida albicans", "Trichomonas vaginalis", "Herpes simplex virus", "A"],
  ["Which tissue processing sequence is correct?", "Fixation, dehydration, clearing, wax infiltration, embedding", "Fixation, clearing, dehydration, embedding, wax infiltration", "Dehydration, fixation, embedding, clearing, wax infiltration", "Embedding, fixation, dehydration, clearing, wax infiltration", "F"],

  // ---------- PRE-ANALYTICS & QUALITY ----------
  ["Control values have been above the mean for 8 consecutive days. Which type of error does this suggest?", "Systematic error", "Random error only", "A single pipetting error", "No error", "C"],
  ["One control value falls outside ±3 SD while the other controls are in range. What is the best action?", "Reject the run, investigate and repeat after correcting", "Report the patient results and ignore the failed control", "Change the reference range so the control falls in range", "Average all the controls and report the result obtained", "C"],
  ["Potassium is 6.0 mmol/L in a sample delivered 5 hours late, unspun and refrigerated. What is the likely explanation?", "Leakage of potassium from cells in the unspun cold sample", "True hyperkalaemia from kidney failure in this patient", "An analyser calibration error affecting all the potassium results", "Lipaemia interfering with the ion-selective electrode readings", "E"],
  ["Lipaemia in a sample for a full blood count most affects which results?", "Falsely raised haemoglobin and MCHC", "Falsely low haemoglobin and MCHC, and falsely raised platelets", "Falsely low platelets only, with all other values normal", "Lower MCV only, with the rest of the indices unchanged", "E"],
  ["A new reagent lot is introduced. What is the best practice?", "Verify with QC and patient samples against the old lot before use", "Start using it immediately because the lot is from the same supplier", "Use it only after the old lot has expired completely", "Check only the expiry date printed on the box", "C"],
  ["A specimen ID mismatch is discovered after results were released. What is the first action?", "Recall the results, notify the clinician, document and investigate", "Ignore it because the results look normal for this patient", "Edit the label quietly so that the records match the tube", "Wait for the next scheduled audit to raise the problem", "C"],
  ["A potassium of 6.8 mmol/L is a critical result. What is the correct action?", "Notify the clinician immediately with read-back and document it", "Wait until the end of the batch before telling the clinician", "Repeat the test tomorrow on a fresh sample from the ward", "Report it only at the next routine ward round", "F"],
  ["Which sample is most affected by being left in sunlight for several hours before analysis?", "Bilirubin", "Sodium", "Creatinine", "Urea", "F"],
  ["A coagulation tube is underfilled. What is the effect on the PT/aPTT?", "Excess citrate, so results are falsely prolonged", "Results are falsely shortened because of less citrate", "No effect, because the analyser corrects the tube volume", "Clotting factors increase in the underfilled tube", "C"],
  ["Which patient preparation matters most for an accurate fasting lipid profile?", "Fasting for 9–12 hours with water allowed", "Eating a fatty meal before sampling to show real levels", "Heavy exercise just before the sample is taken", "Sampling straight after a blood transfusion", "F"],

  // ---------- ADDED: FOUNDATION (Year 1) ----------
  ["A phlebotomist is about to draw blood. What must be checked first, before any tube is labelled?", "The patient's identity, using two identifiers", "The colour of the tourniquet being used", "The time of the last meal only", "Which arm the patient writes with", "F"],
  ["You finish a venepuncture. Where should the used needle go?", "Straight into a sharps container, without recapping", "Back into its cap, then into the general waste bin", "Into the yellow clinical waste bag with the gloves", "Onto the tray until the end of the clinic", "F"],
  ["A tourniquet is left on the arm for more than 2 minutes. What is the likely effect on the results?", "Falsely raised potassium and protein-bound analytes", "Falsely low potassium and a lower haematocrit", "No change, because veins refill the same way", "Falsely low glucose in the sample taken", "F"],
  ["Which of these is the correct way to collect blood from a patient with a drip running in one arm?", "Use the opposite arm", "Use the same arm, just below the drip site", "Use the same arm, just above the drip site", "Stop the drip for a minute and use that arm", "F"],
  ["Which tube colour is used for a full blood count?", "Lavender (EDTA)", "Light blue (sodium citrate)", "Grey (fluoride oxalate)", "Red (plain, no additive)", "F"],
  ["Which tube colour is used for a PT and aPTT?", "Light blue (sodium citrate)", "Lavender (EDTA)", "Green (heparin)", "Gold (serum separator)", "F"],
  ["Which tube is best for a blood glucose that cannot be tested at once?", "Grey (fluoride oxalate)", "Red (plain, no additive)", "Lavender (EDTA)", "Light blue (sodium citrate)", "F"],
  ["Blood splashes on the bench in the laboratory. What is the first step?", "Cover with absorbent material, add disinfectant, wait, then clean up", "Wipe it quickly with a dry paper towel", "Leave it until the end of the shift", "Wash it down the sink with plain water", "F"],
  ["A lab worker pricks a finger with a used needle. What is the immediate first aid?", "Let it bleed, wash with soap and running water, then report it", "Squeeze hard and suck the wound clean", "Cover with a plaster and carry on working", "Soak the finger in strong bleach for ten minutes", "F"],
  ["Why do we wear gloves and a lab coat at the bench?", "To protect ourselves from infectious specimens", "To keep the specimens warm during testing", "To make the results more accurate", "To stop the reagents from spoiling", "F"],
  ["Which of these must never be done in a laboratory?", "Eating or drinking at the bench", "Washing hands before leaving", "Labelling tubes at the bedside", "Keeping the sharps bin closed when full", "F"],
  ["Which is the right order of draw for a plain red tube, a lavender tube and a light blue tube?", "Light blue, red, lavender", "Lavender, red, light blue", "Red, lavender, light blue", "Lavender, light blue, red", "F"],
  ["A sample arrives with no name on the label. What should the laboratory do?", "Reject it and ask for a new, correctly labelled sample", "Test it and add the name later from memory", "Test it and mark the result as probable", "Ask the porter to write the name on the tube", "F"],
  ["For a fasting blood sugar test, how long should the patient fast?", "8 to 10 hours, water allowed", "2 hours, with no water", "24 hours, with no water", "30 minutes, only no sugar", "F"],
  ["Which blood vessel carries oxygenated blood from the lungs to the heart?", "Pulmonary vein", "Pulmonary artery", "Vena cava", "Aorta", "F"],
  ["Which chamber of the heart pumps blood out to the whole body?", "Left ventricle", "Right ventricle", "Left atrium", "Right atrium", "F"],
  ["Where are red blood cells made in an adult?", "Bone marrow", "Spleen", "Kidney", "Liver", "F"],
  ["Which organ filters old red cells out of the blood?", "Spleen", "Pancreas", "Thyroid", "Stomach", "F"],
  ["Which part of the kidney filters the blood?", "The glomerulus", "The loop of Henle", "The collecting duct", "The renal pelvis", "F"],
  ["Which hormone from the pancreas lowers blood glucose?", "Insulin", "Glucagon", "Cortisol", "Adrenaline", "F"],
  ["Which gland controls the body's metabolic rate by releasing T3 and T4?", "Thyroid", "Adrenal", "Pituitary", "Pancreas", "F"],
  ["Which type of white cell is the most numerous in healthy adult blood?", "Neutrophil", "Lymphocyte", "Monocyte", "Eosinophil", "F"],
  ["What is the main job of haemoglobin?", "Carrying oxygen in the blood", "Fighting bacteria in the blood", "Clotting blood after a cut", "Carrying digested food to the cells", "F"],
  ["Which cells help the blood to clot?", "Platelets", "Red cells", "Neutrophils", "Lymphocytes", "F"],
  ["The liver makes bile. Where is bile stored?", "Gallbladder", "Pancreas", "Spleen", "Stomach", "F"],
  ["Which part of the nephron mainly reabsorbs glucose from the filtrate?", "Proximal convoluted tubule", "Distal convoluted tubule", "Collecting duct", "Bowman's capsule", "F"],
  ["Which sugar is the main fuel for cells?", "Glucose", "Sucrose", "Lactose", "Maltose", "F"],
  ["Which organ is the main site of urea production?", "Liver", "Kidney", "Heart", "Lungs", "F"],
  ["What is a normal pH range for human blood?", "7.35 to 7.45", "6.35 to 6.45", "7.95 to 8.05", "5.35 to 5.45", "F"],
  ["Which molecule carries the genetic code in cells?", "DNA", "ATP", "Glucose", "Albumin", "F"],
  ["Which protein is the most abundant in blood plasma?", "Albumin", "Fibrinogen", "Haemoglobin", "Transferrin", "F"],
  ["What do enzymes do in the body?", "Speed up chemical reactions", "Store energy as fat", "Carry oxygen to the tissues", "Make up the cell wall", "F"],
  ["Which stain splits bacteria into two groups using crystal violet and a counterstain?", "Gram stain", "Ziehl-Neelsen stain", "Giemsa stain", "Papanicolaou stain", "F"],
  ["A Gram stain shows purple round cells in clusters. What is the best description?", "Gram-positive cocci in clusters", "Gram-negative rods in chains", "Gram-negative cocci in pairs", "Gram-positive rods with spores", "F"],
  ["Which medium is used to grow most bacteria and to show haemolysis?", "Blood agar", "MacConkey agar", "Sabouraud agar", "Lowenstein-Jensen medium", "F"],
  ["A urine dipstick turns positive for protein. Which organ is most likely involved?", "Kidney", "Liver", "Pancreas", "Spleen", "F"],
  ["A urine sample for culture should ideally be collected as a:", "Clean-catch midstream sample", "First drop of urine only", "Last drop of urine only", "Sample from the toilet bowl", "F"],
  ["Which of these is a sign of a urinary tract infection on a dipstick?", "Positive leukocyte esterase and nitrite", "Positive glucose only", "Negative for all parameters", "Raised urobilinogen only", "F"],
  ["A thick blood film is used mainly to:", "Detect malaria parasites at low levels", "Count red cells on an analyser", "Measure haemoglobin accurately", "Group the blood for transfusion", "F"],
  ["Which of the following is the correct way to carry a microscope?", "One hand on the arm, one under the base", "By the stage with one hand", "By the objective lenses with both hands", "By the eyepiece with one hand", "F"],
  ["Which type of microscope objective is used with immersion oil?", "100×", "10×", "4×", "40×", "F"],
  ["Which of the following is the normal range of haemoglobin for an adult man?", "13 to 17 g/dL", "5 to 8 g/dL", "20 to 25 g/dL", "8 to 10 g/dL", "F"],

  // ---------- ADDED: CORE (Year 2) ----------
  ["A patient has Hb 7.5 g/dL, MCV 65 fL and MCH 20 pg. Which type of anaemia does this pattern describe?", "Microcytic hypochromic anaemia", "Macrocytic anaemia", "Normocytic normochromic anaemia", "Hyperchromic anaemia", "C"],
  ["A thick film shows rings and no other stages, with some crescent-shaped forms. Which species is most likely?", "Plasmodium falciparum", "Plasmodium vivax", "Plasmodium malariae", "Plasmodium ovale", "C"],
  ["A stool sample shows eggs with a terminal spine. Which is the likely parasite?", "Schistosoma haematobium", "Schistosoma mansoni", "Ascaris lumbricoides", "Trichuris trichiura", "C"],
  ["A culture grows pink colonies on MacConkey agar. What does this tell you?", "The organism ferments lactose", "The organism does not ferment lactose", "The organism is Gram positive", "The organism is an obligate anaerobe", "C"],
  ["A patient's ALT is 380 U/L and AST is 290 U/L, with normal ALP. Which organ is most likely injured?", "Liver (hepatocytes)", "Heart muscle", "Bile ducts", "Bone", "C"],
  ["A positive urine ketone result in a diabetic patient with a high glucose suggests what?", "Possible diabetic ketoacidosis", "A urinary tract infection", "Dehydration from a low glucose", "Normal fasting state", "C"],
  ["Which test would you use first to screen a patient for HIV in a clinic?", "A rapid antibody test on finger-prick blood", "A CD4 count by flow cytometry", "A viral load by PCR", "A Western blot", "C"],
  ["A blood group is typed as A positive. Which antibodies are in this person's plasma?", "Anti-B", "Anti-A", "Anti-A and anti-B", "No ABO antibodies", "C"],
  ["Which anticoagulant binds calcium to stop clotting in the lavender tube?", "EDTA", "Heparin", "Fluoride", "Sodium citrate", "C"],
  ["A Ziehl-Neelsen smear shows red rods on a blue background. What do they represent?", "Acid-fast bacilli", "Gram-negative rods", "Yeast cells", "Spores", "C"],
  ["Which test is used to decide if a Staphylococcus is Staphylococcus aureus?", "Coagulase test", "Catalase test", "Oxidase test", "Bile solubility test", "C"],
  ["A fixed tissue block is cut into thin sections using which instrument?", "Microtome", "Cryostat only", "Centrifuge", "Tissue processor", "C"],
  ["A drug is given by mouth and a lot of it is broken down by the liver before reaching the blood. What is this called?", "First-pass metabolism", "Enzyme induction", "Renal clearance", "Drug tolerance", "C"],
  ["In a village, 20 new cases of typhoid appear in one year among 1,000 people who were well at the start. What is this measure?", "Incidence (2%)", "Prevalence (2%)", "Case fatality rate", "Attack rate of an outbreak", "C"],
  ["Which tissue type lines the inside of the small intestine and absorbs nutrients?", "Simple columnar epithelium", "Stratified squamous epithelium", "Transitional epithelium", "Dense connective tissue", "C"],
  ["A spectrophotometer reads a coloured solution. What does absorbance depend on?", "The concentration of the coloured substance", "The weight of the cuvette", "The age of the instrument", "The room temperature only", "C"],
  ["A person is exposed to pollen and develops itching and sneezing within minutes. Which hypersensitivity type is this?", "Type I (IgE-mediated)", "Type II (cytotoxic)", "Type III (immune complex)", "Type IV (delayed)", "C"],
  ["Mice used for an experiment in the lab animal unit must be handled with which principle in mind?", "Use the fewest animals and cause the least suffering", "Use as many animals as possible for reliability", "Keep animals in one cage to save space", "Skip ethics approval for small studies", "C"],

  // ---------- ADDED: ADVANCED (Year 3) ----------
  ["A skin scraping in 10% KOH shows branching septate hyphae. Which group of fungi is suspected?", "Dermatophytes", "Candida species", "Cryptococcus species", "Pneumocystis species", "A"],
  ["A child has fever, a blistering rash and Koplik spots earlier. Which virus is suspected?", "Measles virus", "Varicella-zoster virus", "Rubella virus", "Herpes simplex virus", "A"],
  ["A laboratory information system flags a result that is far from a patient's last result. What is this check called?", "Delta check", "Calibration", "Proficiency testing", "Turnaround audit", "A"],
  ["Evidence from a crime scene is handed from the police to the laboratory. What must be recorded to keep it valid in court?", "The chain of custody", "The reagent lot number", "The room temperature", "The analyser serial number", "A"],
  ["A smear from the cervix is reported as HSIL. What does this suggest?", "A significant precancerous change", "A normal inflammatory change", "A fungal infection", "An atrophic change in menopause", "A"],
  ["A patient has pancytopenia, a hypocellular marrow and no blasts. What is the diagnosis?", "Aplastic anaemia", "Acute leukaemia", "Myelofibrosis", "Megaloblastic anaemia", "A"],
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Short stable id for a question, used by the "seen" memory
function qid(entry) {
  let h = 5381;
  const s = entry[0];
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function readSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSeen(list) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable – ignore */
  }
}


// ---- Year-level matching ----
// Every entry carries a level as its last item: "F" Foundation (Year 1), "C" Core (Year 2), "A" Advanced (Year 3), "E" Expert (Year 4).
// The player's year comes from the "Claim your year" box in the Hall of Fame.
const CLAIM_KEY = "mutmlsa_hof_claim";
const LEVEL_MIX = {
  0: { F: 0.25, C: 0.35, A: 0.3, E: 0.1 }, // year not claimed: a bit of everything
  1: { F: 0.8, C: 0.2, A: 0, E: 0 },
  2: { F: 0.2, C: 0.65, A: 0.15, E: 0 },
  3: { F: 0, C: 0.2, A: 0.6, E: 0.2 },
  4: { F: 0, C: 0, A: 0.35, E: 0.65 },
};
const LEVELS = ["F", "C", "A", "E"];

function getPlayerYear() {
  try {
    const claim = JSON.parse(localStorage.getItem(CLAIM_KEY) || "null");
    const y = Number(claim && claim.year);
    return y >= 1 && y <= 4 ? y : 0;
  } catch {
    return 0;
  }
}

// Picks n entries by the year's level mix, preferring ones this device has not seen yet
function pickByLevel(pool, n, year) {
  const mix = LEVEL_MIX[year] || LEVEL_MIX[0];
  const allowed = LEVELS.filter((l) => mix[l] > 0);
  const keyOf = (e) => qid(e);
  const allKeys = new Set(pool.map(keyOf));
  let seen = readSeen().filter((id) => allKeys.has(id));
  const chosen = [];

  for (let i = 0; i < n; i++) {
    const fresh = (l) => pool.filter((e) => e[5] === l && !chosen.includes(e) && !seen.includes(keyOf(e)));
    let open = allowed.filter((l) => fresh(l).length > 0);
    if (open.length === 0) {
      // Everything this year can get has been seen: forget those and start a new cycle
      const forget = new Set(pool.filter((e) => allowed.includes(e[5])).map(keyOf));
      seen = seen.filter((id) => !forget.has(id));
      open = allowed.filter((l) => fresh(l).length > 0);
      if (open.length === 0) break;
    }
    const total = open.reduce((s, l) => s + mix[l], 0);
    let r = Math.random() * total;
    let level = open[open.length - 1];
    for (const l of open) {
      r -= mix[l];
      if (r <= 0) { level = l; break; }
    }
    const candidates = fresh(level);
    chosen.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }

  writeSeen([...seen, ...chosen.map(qid)]);
  return chosen;
}

function pickQuestions(n, year) {
  const chosen = pickByLevel(QUESTION_POOL, n, year);
  // Build playable questions with a freshly shuffled option order
  return shuffle(chosen).map(([prompt, correct, w1, w2, w3]) => {
    const options = shuffle([correct, w1, w2, w3]);
    return { prompt, options, correctIndex: options.indexOf(correct) };
  });
}

export default function Quiz() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [checking, setChecking] = useState(false);
  const [yearPick, setYearPick] = useState("");
  const [yearError, setYearError] = useState("");

  useEffect(() => {
    loadLeaderboard();
    loadPeriods();
  }, []);

  function loadLeaderboard() {
    fetch(`${API_BASE_URL}/api/quiz/leaderboard?week=${encodeURIComponent(WEEK_ID)}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }

  function loadPeriods() {
    fetch(`${API_BASE_URL}/api/quiz/champions-by-period`)
      .then((res) => res.json())
      .then((data) => setPeriods(data.periods || []))
      .catch(() => {});
  }

  async function checkExistingAndStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setChecking(true);
    try {
      const gate = await ensureYear(name, yearPick);
      if (!gate.ok) {
        setYearError(gate.error);
        return;
      }
      setYearError("");
      const res = await fetch(
        `${API_BASE_URL}/api/quiz/attempt?week=${encodeURIComponent(WEEK_ID)}&name=${encodeURIComponent(name.trim())}`
      );
      const data = await res.json();
      if (data.attempt) {
        setExistingAttempt(data.attempt);
      } else {
        setQuestions(pickQuestions(QUESTIONS_PER_ATTEMPT, getPlayerYear()));
        setStarted(true);
      }
    } finally {
      setChecking(false);
    }
  }

  function selectAnswer(optionIndex) {
    setAnswers((prev) => ({ ...prev, [step]: optionIndex }));
  }

  function nextQuestion() {
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    const score = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const total = questions.length;
    setResult({ score, total });
    setSubmitted(true);

    if (score === total) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }

    try {
      await fetch(`${API_BASE_URL}/api/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: WEEK_ID, name: name.trim(), score, total }),
      });
    } catch {
      /* ignore – leaderboard will simply not update */
    }
    loadLeaderboard();
    loadPeriods();
  }

  const currentQuestion = questions[step];
  const currentAnswer = answers[step];
  const currentLeader = leaderboard[0];
  const claimedYear = getPlayerYear();

  return (
    <section id="quiz" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">This round's quiz</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Lab Science Quiz
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          {QUESTIONS_PER_ATTEMPT} case-based questions, drawn at random from a large pool, with the
          answers shuffled every time. One attempt per person per round.
        </p>
        <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
          {claimedYear
            ? `Questions are matched to Year ${claimedYear}.`
            : "Pick your year when you start to get questions matched to your level."}
        </p>

        {currentLeader && (
          <div className="mt-6 flex items-center justify-between rounded-sm border border-coral-500/30 bg-coral-500/5 px-4 py-3">
            <span className="label-tag text-coral-600">Leading this round</span>
            <span className="text-sm font-semibold text-lab-900 dark:text-dark-ink">
              {currentLeader.name} · {currentLeader.score}/{currentLeader.total}
            </span>
          </div>
        )}

        {leaderboard.length > 0 && (
          <div className="mt-4 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
            <p className="label-tag text-lab-700 dark:text-lab-500">Current round leaderboard</p>
            <div className="mt-2 space-y-1">
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft dark:text-dark-ink-soft">
                    {i + 1}. {entry.name}
                  </span>
                  <span className="font-semibold text-lab-800 dark:text-dark-ink">
                    {entry.score}/{entry.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {periods.length > 0 && (
          <div className="mt-4 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
            <p className="label-tag text-lab-700 dark:text-lab-500">Recent round champions</p>
            <div className="mt-3 space-y-4">
              {periods.slice(0, 4).map((p) => (
                <div key={p.period}>
                  <p className="label-tag text-ink-soft dark:text-dark-ink-soft">{p.label}</p>
                  <div className="mt-1 space-y-1">
                    {p.top.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-ink-soft dark:text-dark-ink-soft">
                          {["🥇", "🥈", "🥉"][i]} {entry.name}
                        </span>
                        <span className="font-semibold text-lab-800 dark:text-dark-ink">
                          {entry.score}/{entry.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!started && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 max-w-sm"
          >
            <form onSubmit={checkExistingAndStart} className="flex flex-wrap gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or nickname"
                className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              {!claimMatches(name) && (
                <select
                  value={yearPick}
                  onChange={(e) => setYearPick(e.target.value)}
                  className="rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink"
                >
                  <option value="">Your year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={checking}
                className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
              >
                {checking ? "Checking…" : "Start"}
              </motion.button>
            </form>

            {yearError && <p className="mt-3 text-sm text-coral-600">{yearError}</p>}

            {existingAttempt && (
              <p className="mt-3 text-sm text-coral-600">
                You've already played this round — scored {existingAttempt.score}/
                {existingAttempt.total}. Come back next round for a new one.
              </p>
            )}
          </motion.div>
        )}

        {started && !submitted && currentQuestion && (
          <div className="mt-8">
            <p className="label-tag text-lab-700 dark:text-lab-500">
              Question {step + 1} of {questions.length}
            </p>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
              <motion.div
                className="h-full bg-coral-500"
                animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="mt-5 rounded-sm border border-ink/10 bg-lab-50/50 p-5 dark:border-dark-border dark:bg-dark-surface/40"
              >
                <p className="text-sm text-ink dark:text-dark-ink">{currentQuestion.prompt}</p>

                <div className="mt-4 space-y-2">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = currentAnswer === i;
                    return (
                      <motion.button
                        key={i}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAnswer(i)}
                        className={`block w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-coral-500 bg-coral-500 text-paper"
                            : "border-ink/15 text-ink hover:bg-lab-100/60 dark:border-dark-border dark:text-dark-ink dark:hover:bg-dark-surface/70"
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={nextQuestion}
              disabled={currentAnswer === undefined}
              className="mt-5 rounded-sm bg-lab-800 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40 dark:bg-lab-600"
            >
              {step < questions.length - 1 ? "Next question" : "Finish quiz"}
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {submitted && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="mt-8 rounded-sm border border-ink/10 bg-lab-50/50 p-6 text-center dark:border-dark-border dark:bg-dark-surface/40"
            >
              <p className="font-display text-3xl font-bold text-lab-900 dark:text-dark-ink">
                {result.score}/{result.total}
              </p>
              <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
                {result.score === result.total
                  ? "Perfect score — nicely done."
                  : "Good effort — see the leaderboard above, and try again next round."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}