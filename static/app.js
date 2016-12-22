// CalHeatmap
var cal = new CalHeatMap();
var clickDate = null;
var windowWidth = 0;
var resizeTimeout = 0;

function monthAgo(month) {
  date = new Date();
  date.setMonth(date.getMonth() - (month-1), 1);
  return date;
}

function calInit() {
  
  var width = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
  
  if (width != windowWidth) {
    windowWidth = width;
  } else {
    return false;
  }
  
  var months = 12;
  
  if (width < 450) {
    months = 5;
  } else if (width < 520) {
    months = 6;
  } else if (width < 600) {
    months = 7;
  } else if (width < 768) {
    months = 8;
  } else if (width < 992) {
    months = 10;
  }
  
  if (cal._completed) {
    cal.destroy();
    cal = new CalHeatMap();
  }
  
  setTimeout(function() {
    cal.init({
      animationDuration: 0,
      data: "/api/heatmap",
      domain: "month",
      start: monthAgo(months),
      domainGutter: 10,
      range: months,
      legend: [1, 3, 5, 10, 20],
      onClick: function(date, nb) {
        
        if (clickDate !== null && clickDate.toDateString() == date.toDateString()) {
          clickDate = null;
        } else {
          clickDate = date;
        }
        
        vue.filterDate(clickDate);
        
      }
    });
  }, 1);
  
}
calInit();

window.onresize = function() {
  
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(function() {
      calInit();
  }, 500);
  
};

// Set moment locale
moment.locale(navigator.language || navigator.userLanguage);

// Vue
var apiURL = '/api';

var vue = new Vue({

  el: '#timeline',

  data: {
    data: [],
    deliveries: [],
    softwares: [],
    environments: [],
    currentSoft: "",
    currentEnv: "",
    colors: [
      '#2ecc71',
      '#5bc0de',
      '#3498db'
    ]
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
      return moment(v).format('LLLL');
    },
    getChangelogURL: function(v) {
      if(v.repository.length === 0) return;
      return `https://${v.repository}/src/HEAD/CHANGELOG.md?at=master`;
    }
  },

  methods: {
    populateDeliveries: function(data) {
      
      this.deliveries = [];
      
      if (data.length) {
        for (var i in data) {
          if (
              (this.currentSoft === "" || data[i].software == this.currentSoft) &&
              (this.currentEnv === "" || data[i].environment == this.currentEnv)
            ) {
            this.deliveries.push(data[i]);
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
      
      this.populateDeliveries(this.data);
      
    },
    filterEnv: function(name){
      
      this.deliveries = [];
      
      if (this.currentEnv == name){
        this.currentEnv = "";
      } else {
        this.currentEnv = name;
      }
      
      this.populateDeliveries(this.data);
      
    },
    filterDate: function(date){
      
      if (date === null) {
        this.populateDeliveries(this.data);
        return;
      }
      
      date = date.toDateString();
      var data = [];
      for (var i in this.data) {
        if ((new Date(this.data[i].date)).toDateString() == date) {
          data.push(this.data[i]);
        }
      }
      
      this.populateDeliveries(data);
      
    },
    fetchData: function () {
      var xhr = new XMLHttpRequest();
      var self = this;
      xhr.open('GET', apiURL + "/deliveries");
      xhr.onload = function () {
        d = JSON.parse(xhr.responseText);
        self.data = d;
        var index, i;
        
        for (i = 0; i < d.length ; i++) {
          
          index = self.softwares.indexOf(d[i].software);
          if (index === -1) {
            self.softwares.push(d[i].software);
            index = self.softwares.length-1;
          }
          
          index = self.environments.indexOf(d[i].environment);
          if (index === -1) {
            self.environments.push(d[i].environment);
            index = self.environments.length-1;
          }
          
        }
        
        self.softwares.sort();
        self.environments.sort();
        
        for (i in self.data) {
          
          index = self.environments.indexOf(self.data[i].environment);
          self.data[i].environmentColor = self.colors[index];
          
        }
        
        self.populateDeliveries(self.data);
      };
      xhr.send();
    }
  }
});