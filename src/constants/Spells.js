export const SPELLS = {
    FROSTBOLT: {
      id: 'frostbolt',
      name: 'Frostblitz',
      castTime: 2000,
      // Best Practice: Spanne als Objekt definieren
      baseDamage: {
        min: 1650,
        max: 2144
      },
      critChance: 0.4,
      critMultiplier: 2.4,
      range: 40, // Reichweite in Metern
      color: '#00bfff',
      icon: '❄️'
    }
};