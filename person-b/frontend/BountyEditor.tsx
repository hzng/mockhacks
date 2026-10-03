"use client";

import { useState } from "react";
import type { BountyCard, Difficulty } from "./bountyApi";
import styles from "./bounties.module.css";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

// Rough row count so long items wrap instead of being cut off (field-sizing: content refines it where supported).
const rowsFor = (text: string, charsPerRow = 60) => Math.max(1, Math.ceil(text.length / charsPerRow));

function ItemListEditor({ items, onChange, addLabel, marker }: {
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  marker: "number" | "check";
}) {
  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className={styles.itemList}>
      {items.map((item, index) => (
        <div className={styles.itemRow} key={index}>
          <span className={styles.itemMarker}>{marker === "number" ? index + 1 : "✓"}</span>
          <textarea rows={rowsFor(item)} value={item} onChange={(e) => update(index, e.target.value)} />
          <button aria-label="Remove" className={styles.iconButton} onClick={() => remove(index)} type="button">×</button>
        </div>
      ))}
      <button className={styles.addButton} onClick={() => onChange([...items, ""])} type="button">+ {addLabel}</button>
    </div>
  );
}

function SkillEditor({ skills, onChange }: { skills: string[]; onChange: (skills: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function add() {
    const skill = draft.trim();
    if (skill && !skills.includes(skill)) onChange([...skills, skill]);
    setDraft("");
  }

  return (
    <div className={styles.skillEditor}>
      {skills.map((skill) => (
        <span className={styles.skillChip} key={skill}>
          {skill}
          <button aria-label={`Remove ${skill}`} onClick={() => onChange(skills.filter((s) => s !== skill))} type="button">×</button>
        </span>
      ))}
      <input
        onBlur={add}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder="Add a skill…"
        value={draft}
      />
    </div>
  );
}

export function BountyEditor({ card, onChange }: { card: BountyCard; onChange: (card: BountyCard) => void }) {
  const set = <K extends keyof BountyCard>(key: K, value: BountyCard[K]) => onChange({ ...card, [key]: value });

  return (
    <div className={styles.editor}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Title</span>
        <input className={styles.titleInput} value={card.title} onChange={(e) => set("title", e.target.value)} />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Summary</span>
        <textarea rows={3} value={card.summary} onChange={(e) => set("summary", e.target.value)} />
      </label>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>What the student will do</span>
        <ItemListEditor addLabel="Add a task" items={card.tasks} marker="number" onChange={(tasks) => set("tasks", tasks)} />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Done when <span className={styles.hint}>you can check these yourself</span></span>
        <ItemListEditor addLabel="Add a check" items={card.done_when} marker="check" onChange={(items) => set("done_when", items)} />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Skills needed</span>
        <SkillEditor skills={card.skills} onChange={(skills) => set("skills", skills)} />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Difficulty</span>
          <div className={styles.segmented} role="group" aria-label="Difficulty">
            {DIFFICULTIES.map((level) => (
              <button
                aria-pressed={card.difficulty === level}
                className={card.difficulty === level ? styles.segmentActive : styles.segment}
                key={level}
                onClick={() => set("difficulty", level)}
                type="button"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Estimated hours</span>
          <input
            className={styles.hoursInput}
            min={0.5}
            step={0.5}
            type="number"
            value={Number.isFinite(card.estimated_hours) ? card.estimated_hours : ""}
            onChange={(e) => set("estimated_hours", e.target.valueAsNumber)}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Reward <span className={styles.hint}>portfolio entry or a local perk, never cash</span></span>
        <textarea rows={rowsFor(card.reward, 80)} value={card.reward} onChange={(e) => set("reward", e.target.value)} />
      </label>
    </div>
  );
}

export function cleanCard(card: BountyCard): BountyCard {
  const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);
  return { ...card, tasks: clean(card.tasks), done_when: clean(card.done_when), skills: clean(card.skills) };
}
