var cal = new CalHeatMap();
cal.init({
    data: "/api/heatmap",
    domain: "month",
	  start: new Date(2016, 0, 1),
    domainGutter: 10,
    range: 12,
    legend: [1, 3, 5, 10, 20],
});


var apiURL = '/api';

var demo = new Vue({

  el: '#timeline',

  data: {
    deliveries: null,
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
      var newline = v.indexOf('\n')
      return newline > 0 ? v.slice(0, newline) : v
    },
    formatDate: function (v) {
      return v.replace(/T|Z/g, ' ')
    },
    getChangelogURL: function(v) {
      if(v.repository.length === 0) return;
      return `https://${v.repository}/src/HEAD/CHANGELOG.md?at=master`;
    }
  },

  methods: {
    filter: function(name){
        if(this.currentSoft == name){
            this.currentSoft = "";
            return;
        } 
        this.currentSoft = name;
    },
    filterEnv: function(name){
        if(this.currentEnv == name){
            this.currentEnv = "";
            return;
        } 
        this.currentEnv = name;
    },
    fetchData: function () {
      var xhr = new XMLHttpRequest();
      var self = this;
      xhr.open('GET', apiURL + "/deliveries");
      xhr.onload = function () {
        d = JSON.parse(xhr.responseText);
        self.deliveries = d;
        for(var i = 0; i < d.length ; i++) {
            self.softwares[d[i].software] = true;
            self.environments[d[i].environment] = true;
        }
      };
      xhr.send();
    }
  }
})