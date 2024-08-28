const videoTable = document.getElementById("videosTable");

const table = new DataTable(videoTable, {
  responsive: true,
  ordering: true,
  searching: true,
  paging: true,
  pageLength: 25,
  order: [[2, "desc"]],
  lengthMenu: [10, 25, 50, 100],
  columnDefs: [{ targets: 0, orderable: false }],
});
