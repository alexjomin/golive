var cal = new CalHeatMap();
var startDate = new Date();
startDate.setMonth(startDate.getMonth() - 11, 1);

cal.init({
    data: "/api/heatmap",
    domain: "month",
	  start: startDate,
    domainGutter: 10,
    range: 12,
    legend: [1, 3, 5, 10, 20],
});


var apiURL = '/api';

var vue = new Vue({

  el: '#timeline',

  data: {
    data: [],
    deliveries: [],
    softwares: {},
    environments: {},
    currentSoft: "",
    currentEnv: "",
  },

  created: function () {
    this.fetchData();
  },

  watch: {
    //currentBranch: 'fetchData'
  },

  filters: {
    truncate: function (v) {
      var newline = v.indexOf('\n');
      return newline > 0 ? v.slice(0, newline) : v;
    },
    formatDate: function (v) {
      return moment(v).format('MMMM Do YYYY, h:mm:ss a'); 
    },
    getChangelogURL: function(v) {
      if(v.repository.length === 0) return;
      return `https://${v.repository}/src/HEAD/CHANGELOG.md?at=master`;
    }
  },

  methods: {
    populateDeliveries: function() {
      
      this.deliveries = [];
      
      if (this.data.length) {
        for (var i in this.data) {
          if (
              (this.currentSoft === "" || this.data[i].software == this.currentSoft) &&
              (this.currentEnv === "" || this.data[i].environment == this.currentEnv)
            ) {
            this.deliveries.push(this.data[i]);
          }
        }
      }
      
    },
    filter: function(name){
      
      this.deliveries = [];
      
      if (this.currentSoft == name){
        this.currentSoft = "";
      } else {
        this.currentSoft = name;
      }
      
      this.populateDeliveries();
      
    },
    filterEnv: function(name){
      
      this.deliveries = [];
      
      if (this.currentEnv == name){
        this.currentEnv = "";
      } else {
        this.currentEnv = name;
      }
      
      this.populateDeliveries();
      
    },
    fetchData: function () {
      var xhr = new XMLHttpRequest();
      var self = this;
      xhr.open('GET', apiURL + "/deliveries");
      xhr.onload = function () {
        d = JSON.parse(xhr.responseText);
        self.data = d;
        for(var i = 0; i < d.length ; i++) {
            self.softwares[d[i].software] = true;
            self.environments[d[i].environment] = true;
        }
        self.populateDeliveries();
      };
      xhr.send();
    }
  }
});