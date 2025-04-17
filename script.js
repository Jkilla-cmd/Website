let facts = [];
let current = 0;

const factBox = document.getElementById('factBox');
const categorySelect = document.getElementById('categorySelect');

async function loadFacts() {
  const res = await fetch('facts.json');
  facts = await res.json();
  showFact();
}

function getFilteredFacts() {
  const selectedCategory = categorySelect.value;
  if (selectedCategory === 'all') return facts;
  return facts.filter(f => f.category === selectedCategory);
}

function showFact() {
  const filtered = getFilteredFacts();
  if (filtered.length === 0) {
    factBox.innerText = 'No facts in this category yet.';
    return;
  }
  const fact = filtered[current % filtered.length];
  factBox.innerText = fact.text;
  current++;
}

factBox.addEventListener('click', showFact);
categorySelect.addEventListener('change', () => {
  current = 0;
  showFact();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    showFact();
  }
});

loadFacts();
