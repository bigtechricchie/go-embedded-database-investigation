const records = Array.from({ length: 50000 }, (_, index) => {
  const title = `Example London listing ${index + 1}`;
  const area =
    index % 4 === 0
      ? "Westminster, London"
      : "London";
  const shortSummary =
    `Example description for London listing ${index + 1}`;

  return {
    id: index + 1,
    type: index % 2 === 0 ? "lost" : "found",
    category: index % 3 === 0 ? "property" : "item",
    title,
    area,
    status: index % 5 === 0 ? "resolved" : "active",
    shortSummary,
    searchText:
      `${title} ${area} ${shortSummary}`.toLowerCase(),
  };
});

const searchTerm = "listing 150".toLowerCase();

const startTime = performance.now();

const filteredRecords = records.filter((record) => {
  return (
    record.status === "active" &&
    record.searchText.includes(searchTerm)
  );
});

const endTime = performance.now();

console.log(`Records: ${records.length}`);
console.log(`Matches: ${filteredRecords.length}`);
console.log(
  `Filter time: ${(endTime - startTime).toFixed(3)} ms`,
);
