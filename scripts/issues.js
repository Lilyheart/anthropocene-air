var issues = (function () {
  let issueURL, projectPages, issueListArr,
      state = 2,
      validTags = ["Bug", "Documentation", "Enhancement", "Suggestion", "Support"];

  function displayTable() {
    let table, filteredData;

    table = $("#issuestable").DataTable({
      responsive: true,
      data: issueListArr,
      columns: [
        {title: "Type", data: "labels"},
        {title: "Title"}
      ],
      columnDefs: [{
        responsivePriority: 1, targets: 1
      }, {
        render: function ( data, type, row ) {
          return "<a href='" + row.web_url + "' target='_blank'>" + row.title + "</a>";

        },
        targets: 1
      }],
      searching: false,
      paging: false,
      info: false
    });
  }

  function getHeaderValue(url, headerValue) {
    let request, arr, headerMap, parts, header, value;

    request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();

    arr = request.getAllResponseHeaders().trim().split(/[\r\n]+/);
    headerMap = {};

    arr.forEach(function (line) {
      parts = line.split(": ");
      header = parts.shift();
      value = parts.join(": ");
      headerMap[header] = value;
    });

    return parseInt((headerMap[headerValue]), 10);
  }

  async function getIssues() {
    issueURL = "https://gitlab.bucknell.edu/api/v4/projects/3880/issues?per_page=100&page=1";
    projectPages = getHeaderValue(issueURL, "x-total-pages");

    // Get Data
    issueListArr = [];
    console.log("Obtaining data at: " + issueURL + "&page=1 of " + projectPages + " page(s)");
    for (let i = 1; i <= projectPages; i += 1) {
      await $.getJSON(issueURL + "&page=" + i, function(data) {
        issueListArr = issueListArr.concat(data);
      });
    }

    // Remove closed issues
    issueListArr = issueListArr.filter(issue => issue.state === "opened");

    for (let issueIndex in issueListArr) {
      if (issueListArr.hasOwnProperty(issueIndex)) {
        for (let i = (issueListArr[issueIndex].labels.length - 1); i >= 0; i -= 1) {
          if (validTags.indexOf(issueListArr[issueIndex].labels[i]) === INVERSE) {
            issueListArr[issueIndex].labels.splice(i, 1);
          }
        }
      }
    }

    displayTable();
  }

  return {
    getIssues: async function() {
      await getIssues();
    },
    issueListArr: function () {
      return issueListArr;
    }
  };

  })();
