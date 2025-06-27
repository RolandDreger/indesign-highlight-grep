//@targetengine "highlightGrep";
//DESCRIPTION: GREP Fundstellen hervorheben 

/*     
    + Indesign Version: 8.0
    + Autor: Roland Dreger
    + Datum: 1. Juni 2014
    
    + Letzte Aktualisierung: 24. Jänner 2020
    
    + Achtung: Gesperrte Ebenen und Opjekte werden nicht durchsucht!
    
    + Hinweis: Im Zuge der Programmausfuehrung wird eine Bedingung (fuer "Bedingter Text") 
      mit dem Namen "::Highlight_GREP::" erzeugt. Diese Bedingung wird nach Beenden des Skripts wieder entfernt. 
    
      Tritt ein Programmfehler auf, bleibt die Bedingung möglicherweise bestehen und muss (wenn gewuenscht)
      manuell geloescht werden.
    
      Wichtig: 
      Wenn im durchsuchten Dokument bereits andere Bedingung (fuer "Bedingter Text") vorhanden sind,
      koennen diese in einigen Faellen durch die Suche ueberschrieben werden.
		
		

		+ Please notice: Locked layers and objects are not searched.
    
    + Hint: At running the script a new condition (Conditional Text) is created. 
      It's called "::Highlight_GREP::". The script applied them to GREP expressions matches. 
      After completion of the script, the condition is normally removed.

      If, for whatever reason, the condition is still existing after using the script, 
      you could open the Conditional Text panel (Window > Type and Tables > Conditional Text) 
		and delete it.
		
		
      
    + Thanks to Peter Kahrel (www.kahrel.plus.com) for his idea to use conditional text for highlighting. 
*/



/* Globals */ 
var _global = {
	"highlightColor": [255,150,0], /* Farbe der Hervorhebung in [R,G,B] (die Farbe kann auch einfach im Bedinfeld fuer "Bedingter Text" geaendert werden) */
	"highlightMethod": ConditionIndicatorMethod.USE_HIGHLIGHT, /* "USE_UNDERLINE" fuer Hervorhebung durch Unterstreichung */
	"alertCounter": false, /* Warnmeldung: Bedingter Text */
	"lastDoc": undefined
};

/* Deutsch-Englische Dialogtexte definieren */
__defPurifierLocalizeStrings();

 
if (app.documents.length > 0) {
    _global["lastDoc"] = app.activeDocument.getElements()[0];
}


/* Warnmeldung: Kein offenes Dokument */
if (app.documents.length > 0) { 	
  app.doScript(main, ScriptLanguage.JAVASCRIPT , [], UndoModes.ENTIRE_SCRIPT, "Highlight GREP");  
} else {
	alert (localize(_global.noDocOpenAlert));
}


function main () {
  
  app.scriptPreferences.enableRedraw = true;
  
  prototypeItemByLabel ();
  
  var _ui = _highlightPalette ();
  _ui.show(); 
}


function _highlightPalette () {
  
  var _doc = app.activeDocument;
  var _hits = 0; // Anzahl der Treffer
  var _sc = 0; // Zaehler fuer Auswahl
  var _filePath = filePath ();
  
  var _palette = Window.find("palette", "Highlight GREP Results", undefined, { borderless: false, closeButton: true });
  if (_palette==null) {  /* refresh UI */   
    _palette = new Window ("palette", "Highlight GREP Results");
    with (_palette) {     
      orientation = "row";
      margins = 10;
      spacing = 0;
      var _columnLeft = add ("group");
      with (_columnLeft) {
        orientation = "column";
        alignment = ["", "fill"];
        alignChildren = ["left","fill"];
        margins = [5,30,15,11];
        var _hitsGroup = add ("group");
        with (_hitsGroup) {
          orientation = "column";
          alignChildren = "left";
          spacing = 0;
          margins.right = 0;
          var _numberOfHits = add ("statictext", undefined, "0");
          with (_numberOfHits) {
            characters = 6;
            graphics.font = "dialog:32";
            if(app.scriptPreferences.version < 9) {
              graphics.foregroundColor = graphics.newPen (graphics.PenType.SOLID_COLOR, [0.2, 0.2, 0.2], 1);
            }
            helpTip = localize(_global.numberOfHitsHelpTip);
          } // END statictext _numberOfHits         
          var _hitsButtonGroup = add ("group");
          with (_hitsButtonGroup) {
            margins.top = 10;
            spacing = 10;
            margins.left = 0;
            try {
              if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                var _selectionButtonIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x1C\x00\x00\x00\x1C\b\x02\x00\x00\x00\u00FDoH\u00C3\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00\u00A6IDATx\u00DAbliia\u00A06`\x01b999*\u009A(  \u00C0\u00C4@\x030\u00C2\re\u00C1#7k\u00D6,<\u00B2iii\u00C3\u00DB\u00FBx<H\x1D\u0097\x1E8p\u00E0\u00D6\u00AD[Tp)\u009A\u0089\x10C\u00D5\u00D4\u00D4\u00A8\u00E0Rd7\x12\u00E9^&R}M\u008C\u00B9Ld\u0084#As\u0099\u00C8\u008B\x19\u00FC\u00B2Ld\u00C75\x1E5\u00D8c\u00DF\x01\fpeV\u0082\u00E9wxdS\u00B23+aC\u00C9\b\u00D3\x01r\u00E9\u00D1\u00A3G\u00D1D\u00AC\u00AD\u00AD)5\u0094\u00A0\x11\u00E4\x18\u00FA\u00F4\u00E9S4\x11iiiJ\r%h\x04vC\u0081m\n\u00EA\u00A6S\u0080\x00\x03\x00\"\u00B9TX!\"\u0086g\x00\x00\x00\x00IEND\u00AEB`\u0082";
              } else {
                var _selectionButtonIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x1C\x00\x00\x00\x1C\b\x02\x00\x00\x00\u00FDoH\u00C3\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00\u00ACIDATx\u00DAb<{\u00F6,\x03\u00B5\x01\x0B\x10\u008B\u0088\u0088P\u00D1DQQQ&\x06\x1A\u0080\x11n(\x0B\x1E\u00B9\u0092\u0092\x12<\u00B2===C\u00DF\u00FB\u008C\u00C0\u00C4?`\u00E9t\u00C5\u008A\x15\u00A7O\u009F\u00A6BD!\u009Bx\x06\f\u0080lSSS*\u0084)\u00C4D\b{\u00E5\u00CA\u0095\u00C4\u00B8\u0097\u0089x\x13\u00897\u0097\u0089$\x13\u00894\u0097\u0089T\x13\u00891\u0097\u0089\f\x13\t\u009AK8\u009DbfV<\x19t\u00A8\u0095\u00A74\u00C9\u00A6\u0084s\x14\u00A9a:p.]\u00B7n\x1D\u009AHPP\x10\u00A5\x05\nA#\u00C81\u00F4\u00F6\u00ED\u00DBh\"\u00AA\u00AA\u00AA\u0094\x1AJ\u00D0\b\u00EC\u0086\x02\u0083\u0096\u00BA\u00E9\x14 \u00C0\x00Z\u00C6V\u00A4\u00F1\u00AE\u0090\u00B5\x00\x00\x00\x00IEND\u00AEB`\u0082";
              }
              var _selectionButton = add ("iconbutton", undefined, _selectionButtonIcon, {style: "toolbutton"});
              with (_selectionButton) {
                size = [28,28];
                helpTip = localize(_global.selectionButtonHelpTip);
              } // END iconbutton _selectionButtonIcon
            } catch (e) {
              var _selectionButton = add ("button", undefined, localize(_global.selectionButtonLabel));
              with (_selectionButton) {
                preferredSize.height = 23;
                preferredSize.width = 23;
                graphics.font = "dialog:11";
                helpTip = localize(_global.selectionButtonHelpTip);
              } // END button _selectionButton
            } // END selection icon                        
            try {
              if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                var _copyButtonIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x1C\x00\x00\x00\x1C\b\x02\x00\x00\x00\u00FDoH\u00C3\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00\u00AAIDATx\u00DAbliia\u00A06`\x01b999*\u009A(  \u00C0\u00C4@\x030t\fe!F\u00D1\u00DA\u00B5k\u00DF\u00BE}\x0Bd\b\x0B\x0B\x07\x07\x07S\u00C7P\u00A0\u0089iii@\u00C6\u00ACY\u00B3\u0088Q\u00CF\bLR\u0098\u00B1\x0F\u00D1\f4\b\u0097)p)\u0088e\u00F4\u0088}\x02\u00DE\u00C7t\u00C8`\u008D}x\u0098\u00A2\u0085/~\x1F\ft\u0098\x12\x1F\u00BE\u00C4z\u009F`J\x1AL\u00DE'>\x10\u0088\u00F2>f\u00D6\x1A\u00C4\u00DE')k\u00D1\u00DD\u00A5\x04\x0B:\x1E\x1E\x1E\x12\\jiiI\u00D09@\x13uuuIp\u00A9.\x18\u008C\u0080\u008A\u008Ff\u00B1\x0F\u00ACU\u00A8k(@\u0080\x01\x00\u0084\u00C98(\u00F7\x01l\u00A1\x00\x00\x00\x00IEND\u00AEB`\u0082";
                } else {
                var _copyButtonIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x1C\x00\x00\x00\x1C\b\x02\x00\x00\x00\u00FDoH\u00C3\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00\u00A6IDATx\u00DAb<{\u00F6,\x03\u00B5\x01\x0B\x10\u008B\u0088\u0088P\u00D1DQQQ&\x06\x1A\u0080\u00A1c(\x0B1\u008A\u00FA\u00FA\u00FA\u009E={\x06dHII\x15\x15\x15Q\u00C7P\u00A0\u0089===@FII\t1\u00EA\x19\u0081I\n3\u00F6!\u009A\u0081\x06\u00E12\x05.\x05\u00B1\u008C\x1E\u00B1O\u00C0\u00FB\u0098\x0E\x19\u00AC\u00B1\x0F\x0FS\u00B4\u00F0\u00C5\u00EF\u0083\u0081\x0ES\u00E2\u00C3\u0097X\u00EF\x13LI\u0083\u00C9\u00FB\u00C4\x07\x02Q\u00DE\u00C7\u00CCZ\u0083\u00D8\u00FB$e-\u00BA\u00BB\u0094`A'((H\u0082K\u00FD\u00FD\u00FD\t:\x07h\u00A2\u009D\u009D\x1D\t\u00E5\u00E9hmJi\u00EC\x03C\u0081\u00BA\u0086\x02\x04\x18\x00\u00CD\u00C1>\u00CA3\u00F0@\u00D7\x00\x00\x00\x00IEND\u00AEB`\u0082";
              }
              var _copyButton = add ("iconbutton", undefined, _copyButtonIcon, {style: "toolbutton"});
              with (_copyButton) {
                size = [28,28];
                helpTip = localize(_global.copyButtonHelpTip);
              } // END iconbutton _copyButton
            } catch (e) {           
              var _copyButton = add ("button", undefined, localize(_global.copyButtonLabel));
              with (_copyButton) {
                preferredSize.height = 23;
                preferredSize.width = 23;
                graphics.font = "dialog:11";
                helpTip = localize(_global.copyButtonHelpTip);
              } // END button _copyButton  
            } // END copy icon          
            try {
              if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                var _clearConditionButtonIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x1C\x00\x00\x00\x1C\b\x02\x00\x00\x00\u00FDoH\u00C3\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u0095IDATx\u00DA\u00EC\u00961\u00AB\u0082P\x14\u00C7}\u008F\u00D0M\x1C\x1BJ$tj\u00D3\u00A9 R\x1A\u00EA\x1B4i\u0093\u00DF\u00C4o\u00E1$mmm:5\x04EC\u009B6EC\x10D\u00E3\u00DB\u00DC\u00DE\u009Fw\u00E1r\u00E9\u009Ae\u00AF\u00B6\x0Ex\u0088k\u00FC:\u00E7\x7F\u00CE_\u00FB\n\u0082@xu\u00D4p\u00A9\u00AA\u00FAB\u00A2\u00A2(\u00DF\u00C2\x1B\u00E2\x03\x15\u00DE2}>\u00A2(\x1A\x0E\u0087\u00F5z\u009D\u00BF\u0095e\u00D9j\u00B5\u00C2\x07\u00C30l\u00DB\u00AEPi\u00BF\u00DFO\u0092\u00E4|>\u00F3\u00C48\u008E\x7F\u00FEb\u00BB\u00DDN\u00A7\u00D3\nPM\u00D3x.\u0088\x00\u00B1\u00D5].\u0097\u00C5bQAS\u009E\x0B\u00E2x<\u00B6,k4\x1A\u00D1\u00AF\u00ED\u00F7\u00FBG5\u00A5\\dp[\u00ADV\u00AF\u00D7\u00F3<\u008F\u009C\u00B7\u00DBmd\u00E8\u00F0\u00E4\u00F4\u00C1m4\x1A\u0087\u00C3\u00E1x<\u00B2\u00E7\u00E0\x12\x1D\u00BA\u00DDne(t<\u009DN\u009DN\x07\u00DA\u00B1\u00FA\u00E6y\u00BE\u00DB\u00ED\u00A0\x03\u00A9\u00BAB\u00FBX\x1DH\x06\x1D%I\x12E\x11:\u00D0=\u009B\u00CDf\u00A6i\x16\x12\u00CB\u00A0 \u00AE\u00D7k\u00DF\u00F7Ad\u00F5u\x1C\x07O5\u00D7u\u009Fq\x14\x1AG\u009E\u00CF\u00E7\u00E8\u0094\u00EAKtX.\u0097\u00CF\u00D8\x14]c\u00BD\u00C9&\u00A2S\u00C2E\u00DEl6dn\u00BC/\x1E\u0082\u00B2\x1B\x0E.~\u0083\u00E88\x18\fn\u00F9\u00AD\f\u008A\u008AH\u00EF,7\fC:\u0099B\u00BF\u00DD\x19T\u009A\u00A6W'\u00B2,c\x1F\u00D9Y\u00D3\u00B9\x15>wj\u00B7FD\u0097\x1C\u00D1l6K\u00FC6\u0099L\u00EEC\u00E1n\u00D8\x1CY\u00D7u\u00B2O%~#\u00E8\u00FBPR\u00DD\u00E7\x1D\u00F5\u00AFw\x14\u00FES\u00BC\x16\u00FA+\u00C0\x00q\u00C6\u00D3\u00F9\u00EAy\u00AE\u008D\x00\x00\x00\x00IEND\u00AEB`\u0082";
              } else {
                var _clearConditionButtonIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x1C\x00\x00\x00\x1C\b\x02\x00\x00\x00\u00FDoH\u00C3\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u00C0IDATx\u00DA\u00ECV!\u0088\x02Q\x14\u00D4\u00BB\x13\u00DC5\u0089\u008A`\u00D8`Z\x04\u0083\u00C5bQA\u00B3U0\u00B9a\u00D9(\u00C8Y\u008C&\x11\x04\u00BB[7o\u00D0`\u00D6\u00A8\x06A\x10\u00C1`\u00D6z\x06\u00CB\r>X>\u00EB\u00FF\u00AB\u00C7\u00ED]r\u00C0\u00F2\u00BE;\u00BE?3\u00EF\u00AD\u00C1\u00E5r\x19\u00F0\x1B\x1F\u00F8\u00C4\u00E3q\x1F\x19\x13\u0089\u00C4[\u00E0\x0F\u00F0\"\u00FD/\u00D2f\u00B3y8\x1C\u00B8G\u008B\u00C5\u00E2\u00F3\x06\u00CB\u00B2D\u00A4\u00EF\u00BA\u00AE\u00CB\u00B2\u00EC\u00AA\u00A6\u00D3\u00E9~\u00BF\u009F\u00CDf\u00A3\u00D1\u00A8\u008Bq<\x1E\x7F\u00DD\u0080_]\u00AF\u00D7\u00C5b\u00D1\u00F5l$\x12\u00E1w\n\u00BAV\u00AB\u00D5\u00EB\u00F5\u00D8~\u00C18\u009B\u00CD\u00EA\u00F5\u00BAS9\x1E\u008F\u00DC~\u0085\u009A\u00DE\u00F3\u0082\u00B1\u00D3\u00E9T*\x15M\u00D3\u009C\u00AF\u00A1\u00D9g\u00AFOH&\u0093\u00A4\u00C3\u00F5z\u00CDd2\u00A5R)\x14\n\u00A1\u00AE(\n\u0086\u0090\u00E8$I\u00AAV\u00ABO]\u009F\u00ED\u00B7\\.O\u00A7\u00D3\u00EDv\u00CB\u00D6\x0B\u0085\x02\u00E9P\u00AB\u00D5~\x1C)\u00E8\u00B8\u00DF\u00EF\r\u00C3\x18\f\x06\u00AC\u00BE0\nG\u00D0\x01\u00EC\u00FC\u0085\"\u0082m\u00DB\u00AB\u00D5\n:B\u009Fp8\f}\u00BB\u00DD.\x04\u00C1\x114\u0081\u00B8\\F \u0088\u00D5\u00C7\u00DDR\u00F6\rx\u00D89\u00DDl6\u00C3\u00E1\u00B0\u00DDnC_\u00EF-%4\ny\u00BC\\.\u00BB\u00DD.\u009F\u00CF\u0093?\u00F0-\u0095J\u008DF#\u00F2MD*4\n\u00B7>\u009F\u00CF\u0094D4\x0B\x05I\u00C7\u00C9dB\u00BE\u0089\u00E6\u00CD\u00CB(6}\u00C4{:\u009DH\u00C7F\u00A3q?\x17\u008FI\u00C9Y\u00B6\x02^\f\u00BB\u00E3\fw\u00DE\x1E\u0090\u00BA\x18\u0081X,\u00E6J\u008F7/'R\u00F3\u00F9\u009C\r9\u00A0\u00AA\u00AA\u00C7\x1C\u009B\u00A6\u00F98R\u00B480|\u00B9\\N4\u00C1\u00DE\u0091\x12\u00E6\u00F4\u00F56\u00FD\u00D5?\x14\u00A8\u00E0/\u00E9\u00B7\x00\x03\x00\u00B2+\u00EAF\u00AAI\u0080S\x00\x00\x00\x00IEND\u00AEB`\u0082";
              }
              var _clearConditionButton = add ("iconbutton", undefined, _clearConditionButtonIcon, {style: "toolbutton"});
              with (_clearConditionButton) {
                size = [28,28];
                helpTip = localize(_global.clearConditionButtonHelpTip);
              } // END iconbutton _clearConditionButton
            } catch (e) {           
              var _clearConditionButton = add ("button", undefined, localize(_global.clearConditionButtonLabel));
              with (_clearConditionButton) {
                preferredSize.height = 23;
                preferredSize.width = 23;
                graphics.font = "dialog:11";
                helpTip = localize(_global.clearConditionButtonHelpTip);
              } // END button _clearConditionButton
            } // END icon clear condition 
          } // END group _hitsButtonGroup
        } // END group _hitsGroup        
        var _liveModusGroup = add ("group");
        with (_liveModusGroup) {
          alignChildren = "bottom";
          var _live = add ("checkbox", undefined, localize(_global.liveCheckboxLabel));
          with (_live) {
            value = false;
            graphics.font = "dialog:11";
          } // END checkboxlive 
        } // END group _liveModusGroup
      } // END group _columnLeft    
      var _columnRight = add ("group");
      with (_columnRight) {
        orientation = "column";
        alignChildren = "fill";
        spacing = 15;
        var _findPanel = add ("panel", undefined, "");    
        with (_findPanel) {
          orientation = "row";
          alignChildren = ["right","fill"];
          margins = [13,15,13,4];
          var _findPanelColumnLeft = add ("group");       
          with (_findPanelColumnLeft) {
            orientation = "column";
            spacing = 5;
            var _inputGroup = add ("group");
            with (_inputGroup) {
              spacing = 0;
              margins.right = 2;
              add ("statictext", undefined, localize(_global.findWhatStatictextLabel));
              var _inputGrep = add ("edittext", undefined, "", {multiline: false});
              with (_inputGrep) {  
                active = true;
                characters = 42;
              } // END edittext _inputGrep                       
              // Icon Sonderezeichen fuer Suche einfuegen
              try {  
                if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                  var _wildcardsFindIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u0088IDATx\u00DA\u00ACT\u00BDJ\u00C3P\x18M\u00C5\u00CD\u00E4\x05\u00B2\u00B8%\x0F`\x1E }\u0081\u00CEb\u00E6\u00D2\u00C9E:\n\u00E2\x1E\x04\u00C1\u00A5tv\x17K\u00E7\x04\u00E7\u00F8\x00\u00E9,}\u0081\x1B7!\u009E\x03'r\u0089i\x12\u00B1\x1F\x1Cro\u00BE\u00EF;\u00F7\u00FB\u00BBwR\u00D7\u00B5sL9q\u008E,\u00A7}\u00CA\u00AA\u00AA\u00A6\u00F8\x04@\u00A8_\u00EF@\u00E6\u00BA\u00EE\u00FE\u0090\u00CF\u00A4+e\x10\u0091`)\u00A2\u00BD@\u0089\u00F4]\u0081\u00F4yT\u0084\"{\x00\fp\x03\u00C7\u00C2\u00D2y:h\u0081\u00B5\u0081\u00EE\u00B57B9\u00AC\u00B5\u009D\u00C3\u00C1\x1C(\x05\x0F\u00F4\u00A1\u00BF\x1Cj\u00CA\u008C\u0086@J28F\u00C0\x1A\u00D8\x02\u0089\u0088(\x1B\u00DAQ?D\x18\x03\x05\u00D3\u00841\u0089\u00EFu\x00k\u00B8\u00D0\u00DA\u0081>\u0093}8D\x18\u00AA\u0093\u0094+\u0080%\u00B8\x03\u00C1\\\u00FF\u00CA\u00D1sh\u0085_Z\x1D-\x15m\u00A3\u00DBY\u00B5\u00FE\u00F3`\u00FB\u00EA\u00B4\u00A3H\x1Dk|\u00A6\u00FAf}c\u00D3vf\u00A4lJ\u00A2\u00F4)\x01\u00F6\u008E\u00EA\u00D99\u00E0?\x11BY\u008A\u00F4\u00C2\u00EAd\u00E3\u00CCy\u00E3<&j\x14m\u00D3\u00CE\u00BC8\u0087\r\u008C1K\u00E0\r\b\u00B5\u00F7\tK\x1F\u00DA\u00FB.\u00B4\tI\u00B0\x05\u00D6\riK\u00EF5\u00EB,\u00CB6\u00C0y\u00DB\u00E6\u00D7]F\u008DfJ\u00D3S\u00D1\u00D9YW]\u00E7\u008C\u00AEh\u0097\u00E79\x1D?9V\u00C0c\x1C\u00C7_\u009Dw\u0099\u00F7\x13\u00A4\u0085\x1A\x11\u00A9\u00A3F5\u00DC\u00B5\u00CC\u00CFT\u00CB@At?_\u00EA^:\u00E2\u00F9\u00E3A\u00B7\u00C0\u00D3\u00A8\u00F7p@^\u0080k\u00A4\u00FA1\u00F8\x1E\u00FEG\u00BE\x05\x18\x00\u0090\x01\f\u00D98\u00AC\u00B5\x03\x00\x00\x00\x00IEND\u00AEB`\u0082";
                } else {
                  var _wildcardsFindIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u0084IDATx\u00DA\u00ACT\u00B1J\u00C4@\x14L\u00E4:\u00CD\x0F\u00A4\u00B1K>\u00C0|\u0080\u00F7\x03\u00E9\u0092\u00C2\u00D4beg)\u0088\u00FDq \u00D8\x1CW\x1F\x1C\u00A9\u00C4pu\u00C0:~@\u00AE\u0096\u00FB\u0081`'\u00C4\x19\u0099@X\u00F7.A\u00EF\u00C1\u0090Mv\u00DEd\u00DF\u00BE\u00D9u\u00DB\u00B6u\u008E\x19'\u00CE\u0091crh\u00D2u\u00DD)\x1E\x01\x10\u00EA\u00D3;P\u00A2\u00AA\u00DD\u00DE\x1C[\u00C9\x10\u00A2\u00C0\u009D\u0084v\x02#\u00D2s\u0081\u00BC\u0095U\u0091\u0082}Hd\x03\u00AC)`\u00CCy\u00C0#\u00F0\x06\u00C4f\u00EE\x0F\u00C7\u0092\u00B0\x16<[\u0082xsrlsfSb\u00C0\x07f\u0098lPz\x04,\u0081\r\u0090\x01s\u00F1\n\u00F28?\u00D4\u00E5K\u00A0\u0082X\x05\u00B2\u00AF\u00F2|\u00ED\u00E1\u008D\u00C6\\I)~8$\x18\u00AA\u0093\u008C+m\u00C1\x03\x04\u00AE\u00F5\u00AD\x1E\u00ED\u00C3\u00DE\u00F2\u00EB^Gk\u00AD\u00B6\u009B\u00DB\u008A\u00EB\u00FD\u00C5\u00D8,\u00AF\u00D1\u00B8\x13\u00E8\u00EC3\u00D5\u00B3<dl3\u0099+eS2\u0095\u00CF\b\u00F0\u00EEh?\u00AD\x06\u009F\u00F4\u00FCX\u0083L\u00D1\x0B\u00FD\u00B9\u00D0\u009E2y\u00A5q&zE'\f\x1A[\u00A7\u0083\u00A6\r\u00F5\u00CE\u00B2}\u00C3\u00F4\u00FE>\x7F\u00DA\u008C\u00ED\u00EB\u0094,;Q\u00D3\u00F8\u00DD8I\u0092\x02879\u00BF\u00CE2\u00CA\u008EU\u00A6\u00A7\u00D2\u00D9\u00D93u\u009D\x1E]\u0090\u0097\u00A6)\x13?i+\u00E0)\u00CF\u00F3/\u00EBm\u0083\u0084W\u0088VjD\u00A4\u008E6\u00DA\u00B7\u00ADA?\u00D5^\x06Z\u0084\u00FD\u00FAR\u00F7f#\u00AE?\u00FE\u00E8\x1Ex\x1Eu\x1F\x0E\u00C4\x0Bp\u008BR?\x06\u00EF\u00C3\u00FF\u00C4\u00B7\x00\x03\x003\u00FC\x17\r\u00F9\u00EA\u00C2\u00F2\x00\x00\x00\x00IEND\u00AEB`\u0082";
                }
                var _wildcardsFind = add ("iconbutton", undefined, _wildcardsFindIcon, {style: "toolbutton"});
                with (_wildcardsFind) {
                  size = [22,22];
                  helpTip = localize(_global.wildcardsFindHelpTip);
                } // END iconbutton _wildcardsFind
              }
              catch (e) { 
                var _wildcardsFind = add ("button", undefined, "@");
                with (_wildcardsFind) {
                  size = [22,23];
                  helpTip = localize(_global.wildcardsFindHelpTip);
                } // END iconbutton _wildcardsFind
              } // END Icon Sonderezeichen einfuegen            
            } // END group _inputGroup 
            var _findFormatGroup = add ("group");
            with (_findFormatGroup) {
              alignment = "right";
              margins.right = "27";
              // Icon: Refresh FindStyles
              try {
                var _refreshFindStylesIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x11\b\x06\x00\x00\x00\u00D0Z\u00FC\u00F9\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01=IDATx\u00DA\u00AC\u00D4=H\x03A\x10\u0086\u00E1\u00BDD4*\bZ*A\u00B1\u00B3Ke%b\u00A1\u00A0\x07\x01[\u0083\u0085\u00B5\bi\u00D2\u00A4\u00B6\u00B1\x14\x05{\x0B\x7FJA\u00B4\u00B3\u00B2S\u008BtV!\u0085\u00C4RA\u0088\x1A\u0089\u009E\u00EF\u0084\x11\u0086e\u00AF\u00F2\x16\x1E\b\u00BB\u00CBw\u00B7;sqI\u0092\u00B8\u00FF\x0E\u00C9\x18HY\u009B@\u008CyL\"\u00876\u00EEq\u00817\u00DD\u00B7\u00813\u00F9\x11IZ\x14E6d\x01;\x18\u00C5'\u009Ed\x1F\u008A\x18B\x07\x07\u0098F\x05\u00E5~\u0086\x17\u00B4\u0088\x1A\u00DEq\u008C\x1B|\u00E9\u00DA \u0096\u00B1\u0085a\u00F3\u00E0\u00B2\x7F\u00B4qlkH\x1D-\u00EF\u00B8\x12x\u00ADo\x12\u00FBwa\u0083f\u00D1\u00C3I \u00C4\u0099;\u0089C\x0B\u00FE\u00D1$X\u00CA\u00F8\x1D\u00D8+\u00F73\x17\u0098o\u00F4+\u009FU\u00F9s.\u00A3a\u00EF\u00A8\x14X\x7FD70\u009F\u00D7\u0096\u00E8\u0085\u0082v\u00BD\u00CD\u00D2h\u008D\u0094\x17X\u00C1&\u00F6\u00F1\u00E0\x07\u00D9!e>MY\u009B\u00D1^\u0092\u00D1\u00FC\u009BL\u00BB\u00A3%\u00ACi\x13:\u00D3\u0090\u00AB\u00D8\u00C3\b\u008E\u00F0\x1A*\u00FF%\u00CE\u00B5\u0087\u00AA\u00BA\u00B9\u00AB\u009FH\u00A2\u009FH\x01\x1F8\u00C4\u00AD\u00AD\u009A\r\u00AA\u0098\u00E3\u008Ca]?\u00DA)\u00FC\u00E0\x19w\u00B8\u00C2\u008B_~\u0097\u00E9\u00DFH\x16a\u00BF\x02\f\x00\u00BD/g\u00CDu\u00B8\u009C'\x00\x00\x00\x00IEND\u00AEB`\u0082";
                var _refreshFindStyles = add ("iconbutton", undefined, _refreshFindStylesIcon, {style: "toolbutton"});
                with (_refreshFindStyles) {
                  size = [24,24];
                  helpTip = localize(_global.refreshFindStyles);
                }
              }
              catch (e) { 
                var _refreshFindStyles = add ("button", undefined, "R");
                with (_refreshFindStyles) {
                  size = [24,24];
                  graphics.font = "dialog:11";
                  helpTip = localize(_global.refreshFindStyles);
                } // END button _refreshFindStyles
              } // END Icon: Refresh FindStyles          
              var _findCharacterStyles = add ("dropdownlist", undefined, _doc.characterStyles.everyItem().name);
              with (_findCharacterStyles) {
                graphics.font = "dialog:11";
                graphics.foregroundColor = graphics.newPen (graphics.PenType.SOLID_COLOR, [0.13, 0.13, 0.13], 1);
                maximumSize.width = 165;
              } //END dropdownlist _findCharacterStyles
              var _findParagraphStyles = add ("dropdownlist", undefined, _doc.paragraphStyles.everyItem().name);
              with (_findParagraphStyles) {
                graphics.font = "dialog:11";
                graphics.foregroundColor = graphics.newPen (graphics.PenType.SOLID_COLOR, [0.13, 0.13, 0.13], 1);
                maximumSize.width = 160;
              } // END dropdownlist _findParagraphStyles
              writeStyleItems (_findCharacterStyles, _findParagraphStyles);        
            } // END group _findFormatGroup             
            var _placesGroup = add ("group");
            with (_placesGroup) {
              alignment = "right";
              margins.top = 16;
              margins.right = "27";
              // Icon: Ausgeblendete Ebenen und Objekte einschließen
              try {
                if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                  var _hiddenLayersIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x13\x00\x00\x00\x11\b\x06\x00\x00\x00?\u0098\u0097\u00C7\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x02\u00E9IDATx\u00DA\u008CT[H\u00D3a\x14?\u00FF\u00FD\u00E7\u00BCl\u00EA\\\u00A6\u00AB\rT\u00BCnZ\x1B9d\u0094 {\x0B\u0082\u00C0\u00A7^\u00A4\u0087ADQ\u0090\u00DD\x18\u00BD\t\u0083\u00EA%\u009F\u00C2^\u00F2\u00C5\x1E\u00A2B}\t\x1F\u0086F\u0081\u008A\x18\u00F3ApK\u00F7\"\u00BB4w\u00D3\u00E9p,\u00D8\u00D6\u00EF\u00FC\u00C9?3/u\u00E0p\u00CEw\u00BE\u00F3\u00FD\u00BEs\u00FB>abb\u0082N\u00A3\u00F1\u00F1\u00F1\u00AB\x10/\u00C0\x1E\u00F0\u0088\u00D3\u00E9\u00CC\u0094\u00EE\x0F\r\r\u00C9\u00BA\u00E2\x14\u00906\u00F0dMM\u00CD\u00CC\u00C0\u00C0\u0080\u00A5\u00BD\u00BD\u00FD1\u00CC~\u00D8n\u009CtFy\f\u0088\x06\u00E2YYY\u00D9#\u00AB\u00D5\u00AA\u00EA\u00EE\u00EE&\u0085BA\u00AD\u00AD\u00AD\u00D4\u00D9\u00D9iXXXx\x0F\u009F[\u00F0\u00B9\u008F(}\u00A5g\x05\u0097\u00CB%)KKK\x02\u00C4M\u00F0sDq\u00AE\u00B7\u00B7\u0097\u00AA\u00AA\u00AA\u008E\u00DC^(\x14\u00C8\u00EF\u00F7\u0093\u00D7\u00EB\u00FD\x05\x1A\u0085\u00C9=77\u0097\u0091\u00C1\x00d\u0087>\u00DA\u00D0\u00D0`\u00EF\u00EB\u00EB#H\u00FA\x17e\u00B3YZ^^\u00A6@ \x10\u00C4\u00F2!\x00?\t\x0E\u0087\u00E3%\x16O\u00ECv\u00BB`6\u009B\u008FD\x11\x0EGhw7MMMM\u00A4\u00D1h\u008E\u0080nmm\u00D1\u00E2\u00E2\"\u00A5R)\u008F\u00D8\u00D2\u00D2\u00E2\u0085M\u0087\u00C5%\u00B5Z-\u00D4\u00D5\u00D5IN;;;\u00B4\u00BE\u00BEN\u00C5bQ\x02\t\x06C\u0084\u00B4\u00A8\u00BA\u00BAZ\u00AA\u00E1\x01UVVR.\u0097\u00A3h4z\u00BE\u00B4f\u0097!\u00C6\x1A\x1B\x1B/\x1A\f\x06\x12\x04\u0081\u00A0\u00CBu\u00CB\u00E7\x0B\x14\u008F\u00C7h\x7F\x7F\u009F\u009A\u009B\u009BI\u00AB\u00D5\u00E2\u0082 \u009FC\u00E4\u00BB\u0093p\x19\u0096\u00BB\x19\u0089D\u00BEC|\u008C\u00C7\u00E3f\u00B0\x12\u009D\u00A4\u008A\u008A\n9\x02QT\u0090^\u00AF\x07X\u0096|>\x1FmnnR&\u0093\t \u00CA\u00BB\u00A8\u0097G\x1E\u008D\u00A9\u00A9)\x07\u00C4k8\u009B,\x16\x0B)\u0095J\u008A\u00C5b\x12wtt\u0090N\u00A7\u0093k\x18\u008D\u00FE\u00E4\u008B%\x1D\u0097\u009E\u00CD\u00E7\u00F3m]]]\u00B3\u00E8pA\u00C0\u00EC\u00BCBJ\x0Fl6\u009B`4\x1A\x0F\x15woo\u008F\x12\u0089\x04\u00D5\u00D7\u00D7K\u0080\u00E8\u009C\x04\u00C2eP\u00A9T\u00D2\u00FE\u00CA\u00CA\n%\u0093\u00C9y\u00B8\u00DF\x16\u00E1\u00C8\r0\"\u00EF\x0B\u00B5\u00B5\u00B5\u0087f\u00AB\u00BC\u00BC\u009C\u00D8\u00C6\u0087\u00B8>\f\u00CA\u00A9\u008A\u00A2(\u00ED3 \"\u00E3\f\u00F4XF\u0085\u0083\u00B7\u00E9v\u00BB\u00AFA\u00BCAq\u008D===\u0084\x17p\u00EA\u009C\u00A5\u00D3i)\u00AA\u00ED\u00ED\u00ED\u00AF\x1C\x15\u00D2\u00FC!\"M\u00CE\u009DL&\u00D3\x06\fo1\x12ZDa\u00E31\u00E11\u00F8\u009B8\u0092\u00B5\u00B55~\x01I\f\u00EE=\u00EE\"\u00CE%\u00A4&\u00F5\u00F7\u00F7\u00CB\u008E\x00\u00CC\u0081?\u00AF\u00AE\u00AE~\t\u0085BW\u00D0\u00AD3\u009C\x1A7\u0084\t\u00B3\u00C4\x03Z\u00C4\u00A0\u00BE\u00C3\u00F2\u00FA\u00E0\u00E0\u00E0\u00FC\u00F4\u00F4\u00F4\u00C9\x0F\u009D\tN\u00DF\u00D0a+\x00GP\u008Fa<v%w6\x1C\x0Eo`\u00FB\x0E\u00F6g\u00FF\u00EB\u00D7(\x01\u00CCB<\x05\u00E8\x07\u00D4f\f\u00FA\f\x7F\x02\x7F\u00EC\u00C7\u00D2o\x01\x06\x00D\rX\u00B7\u00B0\u00E9\u00CE:\x00\x00\x00\x00IEND\u00AEB`\u0082"; 
                } else {
                  var _hiddenLayersIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x11\b\x06\x00\x00\x00\u00D0Z\u00FC\u00F9\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01xIDATx\u00DA\u00CC\u0092\u00BD\u008A\u00C2@\x14\u0085O\u0096 \u008AE\x04\u00B7QRG\u00F6\r\u00A2\u00B2\u00DB\u00E5\x05\x02\u00A9l|\t!\u00A4\x13K\u00C1\u00C2.\u0085E\u009E\u00C0\u00C2\u00C6z1y\x07E\fi\u00C4b\x1B\x1B\x05\u00C5\u008C\u00990#\u0093\x10w\x1B\u008B=0\u00CC\u00E4\u00FE|\u0084s\u00AFD\b\u00C1+\u00F4\u0086\x17\u00E9\u00FF\u0081@=\u00FA\u00C5'm4\x1A\x11\u00DB\u00B6i\u0081\u00F6\u00AC\u0097\x1E\u0089C$I\u00CA\x00&\u0093\u00C9\u00FAp8<\x1Ah\u00BER\u00A9`8\x1C\u00B6\u0092\u00D0\u0086\u00C7\u00B9\u00F2 \u00CDu\u00DD\u00F5v\u00BB\u00CD\u00833\u00AA\u00D5jp\x1C\u00A7\u0095\u00F4n\u008A@\u00DA`0X\u008B\x00\u009A\u00ABV\u00AB\u00B8\\.\u00B8^\u00AF\u00C8\u00E7\u00C6\u00E3\u00F1\x03&\u009A\u00BD\u00A1\u0089z\u00BD\u009E~\u00C4q\fUU1\u009DN\u00B1\\.\u00D1h4p\u00BB\u00DD\u00D2\\\u00B9\\\u00CE@2\x7F$j\u00B1X\x10\u00CB\u00B2\u00E0y\x1ED/\u00FA\u00FD>f\u00B3\x19z\u00BD\u009E\u00F4\u00E7\u00F8\u00DB\u00ED61\f\x03\u00BB\u00DD\x0EQ\x14A\u0096e\u0094J%\u0084a\u0088\u00D5j\x05\u00D34\u00D1\u00E9t\u00C8\u00D3\u00F1S\u00C0\u00E9t\"\u00E7\u00F39\u00BD\u00F9\t\u0082\u0080\u00CC\u00E7\u00F3L\u008C\u00D7\u00E9\u00BAN\x1E\u00EB#\u00EC\u00D1Gr>9Pl\u00C8Ch\r\u00AD\u00A5=E \u0085\u00C1R \u00FD\u00FD<L\x04\u0088\u0090\u00CCB\u00B2\x15P\u00D8\u00B3\u00C9\u00EE\u00F7n\u00B7\u00FBM\x1F\u00BE\u00EF\x7F%\u00D7\x0F\u008B\u00EF\u0099-\u00C7\u00C2\u00A9\u00B1=Q\x04\x0B\u009B9K\u00F7\u00C2\u00FB(N\u00B4\b\u00C4\u00A5<Y\u00EC\u00A38(\u00AE\u00BB\x00\x03\x00\u00B2X*#\"J-\u009D\x00\x00\x00\x00IEND\u00AEB`\u0082"; 
                }
                var _hiddenLayers = add ("iconbutton", undefined, _hiddenLayersIcon, {style: "toolbutton", toggle: true});
                with (_hiddenLayers) {
                  size = [20,19];
                  helpTip = localize(_global.hiddenLayersHelpTip);
                } // END iconbutton _hiddenLayers
              }
              catch (e) { 
                var _hiddenLayers = add ("checkbox", undefined, "");
                with (_hiddenLayers) {
                  helpTip = localize(_global.hiddenLayersHelpTip);
                } // END iconbutton _hiddenLayers
              } // end Icon: Ausgeblendete Ebenen und Objekte einschließen
              // Icon: Musterseiten einbeziehen 
              try {
                if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                  var _masterPagesIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x13\x00\x00\x00\x11\b\x06\x00\x00\x00?\u0098\u0097\u00C7\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x02\bIDATx\u00DA\u00ACS\u00B1N\x1BA\x10}k\u00B9\u008ES\u00F8\x03l\t\u00CB\x0Er\u0083\u00EF\u0090\u00A0\u008B\x0B\u00FC31\rBD\n\u008D[\u00D2\x01\u00CE\u0087\\z\u00A7 M,%\u008DI|\u00E7s\x15\u00C7\u00C2\u008D\x0B@\u00823\x11\u00B7\u009B\u00D9\u00D9\u00DB\u0093\u00CF B\u00A4\u00DCi\u00B5;\u00F3f\u00DE\u00CE\u00BC\u00DD\x15J)\u00FC\u00AF/\u00F7\u009C\u00A0Z\u00AD\u00A6h\u00FC5N\u00AC\u00D8N\u00B5Z\u00FD\u00FA\u00DCJF\u00A3\u0091K\u00D3\u00B7\u00C7\u00C8R\u00A2n\u00B7\u009BIj\u00B7\u00DB\u008F\u00FAV\ts\u00CBDovw\u00D9\u0090RA)\t%%d\u00A2\u00A9\u00A4\u00B5\u00D6W.\u00F9t|\u00A9T\u00D2\x058\u0096,C\u00A4?M\u00A4\tu\u0092\u008A\u00A5\u00F1i;\u0096\u0089/Nc\u00F7\u00F6\u00F7\u0091t\u00E4\u00E4mk\x1FNO\u00D3\x00\u00AE\u0082~\u00C1\u00C4\u00D6\x17C\t\u00C1\x0E\u00A1\u008C:\u00CB9\u009A'\u00AF\x17GG\u00EFY=A\u0089\u0093_\x13|>;\u00C3\u00AB\u00F5u\x14^\x14\u0090\u00E4\u00E1\u00F7\u00FD=\u0093O&?qq1\u00C3\u00E1\u00BBC\x14^\x16\u00CC\u00A6\x14t\u00F0\u00F6\x00y\u00DB\x16\u0092*<\u00CF\u00C3t:\u00C5\u00CDm\u0084f\u00F35\x11\b[\x1At\u0091\u009E\u00F7\u00D1\u00E0\u00AD\x1B\u00C2\u009B\\\u0084\u00BD\u00AB9C\u00A2X\u00A3\u00C5b\u0081\u00C1`\u0080Vk\x07\u00C3\x1F\u00DF\x13\u009D\u008C>Z\u00AB\u00C8\u00E2;-\f\u0087CsP\u00B1\u00C9M\u00C9X#\x1A\u00BE\x1F\u00D0\u00E9\u0094y\f\u00CE\u00CFqy}\u00959\u00CD\u00C0\u00F7Q.\x13^.1\u00E9\u00F5\u00D5%\u00E1F\u00DFLez\u0084\u00E3P[\u0098\u00CDf\f\u00FA\u00B4\u00BBm\u00C1\u00E0c\u009E->$r\u00CE\u0095\u00F2a\u009B\u009Fz=\u00D4\u00EBu\u00B6\u00F5\x1C\x04\u00A3\u0094L\u00E3\u00BD\x07x`\u00AE\u0091Z!\x1B\u0087!;\u00B6\u00B6\u00B7\u00E0\u00BA\u009Bh4\x1A\u00E8\u00F7\u00BF \u008A\"\u00F6\u0087\u00E1\u0088\u00E7m\u008Do\u00BA\u00D8hl\x10\u00DE'\u009D\u00EF\u0090tiOSa\u00AD\u00B2\u0086\u00E3\u0093csvd;\u008EK\u00A4\u00AE\u008DC\u00A5R!\u00FC$\u00C1\u00C1\x1B\u00EA!\u00A0\u00D2\u00DB \u00FE\u00F5q?\u00F5\u00E8\x05\x11\u00A1\u00D3\u00E9<\x19H\u00B8.P\u00D8\u00C7>\u009F\u00CFy.\x16\u008B\u0099\u00B8?\x02\f\x00Z\u00E9`\u00B5wK\u00A3\u009F\x00\x00\x00\x00IEND\u00AEB`\u0082";
                } else {  
                  var _masterPagesIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x11\b\x06\x00\x00\x00\u00D0Z\u00FC\u00F9\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u00B2IDATx\u00DA\u00ACT\u00BB\u008A\x02A\x10\u00EC=.\x11\x03\x03\u00A3\u008B\u00D6@P4\x12\x04\u00BD\u00C4G\"~\u0083\u00A9\u0082\x1Fb\u00EA\u0097\u00F8\x05jd\"\u0097if\u00A4\u00E2\u0082\u00B0\u00A8(\u00BBr\u0082\u00EF\u00BE\u00A9F\u00C5\u00BD\u00F5T\x0E\x1B\u009A\u009E\u009E\u00E9\u00EA\u00A9\u00A9\u0099]\u008D\u0099\u00E9\x15\u00F6F/\u00B2\u0087\u008D*\u0095\u00CAs\u0094q\u00B4{\x1E\u008F\u00C7\u00F9Q\r\\\u00FB\u00ADQ\u00A1P\u00E0\u00F9|.c\u008F\u00C7C\u0086aP8\x1C\u0096\\\u00D34Z,\x16T\u00AF\u00D7\u00B5\u00BB\u008C\u00AA\u00D5*'\u0093I>\u00DB\u00F1x\u00E4h4\u00CA\u00FB\u00FD^|\u00BB\u00DDr.\u0097\u00E3r\u00B9\u00ECb\u00F9~nX*\u0095\u00B8\u00DF\u00EF\u00D3f\u00B3\u0091\\5\u0091\u00B8\u00DB\u00EDd\u008CbD\u00B0j4\x1A\x14\b\x04x4\x1A]\u0098]\x1A\u00ADV+j\u00B5Z\x17\u00C09\u00C2\x15\x1B\u00C9\x11k\u00B5\x1A\x1D\x0E\x07\u008A\u00C5bh\u00AA\u00ABy\u00C3qk^\u00AFW@\u00DDn\u0097\u00F2\u00F9<u:\x1D\x01\x02\x04V\u00C83\u0099\u008CD\u00CC\u0081\u00D9I7\u009FC\u00A3b\u00B1(:d\u00B3Y^\u00AF\u00D7\u009CN\u00A7\u00D9\u00B6m\u00D6u\u009Dg\u00B3\x19G\"\x11\u009EL&\u00EC\u00F7\u00FB\u00D94M\u00C6\u00D1\x14\\W\u00EEsh\x04\u00C3N\u00D0(\u0095J\t\x0B0R\x02K\u009CN\u00A7\x14\f\x06%G\u00DDr\u00B9\u00FC\u00FBA\x02`Y\x165\u009BMR\u00BB\x0B\b\u008Dqd\u00CC\u00F7z\u00BD\u00E7\x1B\u00B5\u00DBma\x03\u00AD`h\x04\u00E0`0\u0090\u00F5\u00E1p\u00E8\u00D0\u00C8uk\u00E3\u00F1\u0098B\u00A1\u0090c\x11\u00C5`\u0090H$DG<F\u00E4\u00B7\u00EC\u00F2\u00B2q\u0095*|\u00B8\n4\u00EDK\u00D5|\u00DE\u00C0\u009A\u00A7h\u00A9u\u00FB\u00FAh\u00D6i\u00D1\u00E1\u00EA\u00A3\u00A5\x1B\u00F3\u00DFW\x18\x17#\x04\u00DF?\u00FE 6z\u00FC\b0\x00\u00ACr\u0094t\u00B7\x06s:\x00\x00\x00\x00IEND\u00AEB`\u0082";
                }
                var _masterPages = add ("iconbutton", undefined, _masterPagesIcon, {style: "toolbutton", toggle: true});
                with (_masterPages) {
                  size = [20,19];
                  helpTip = localize(_global.masterPagesHelpTip);
                } // END iconbutton _masterPages
              }
              catch (e) { 
                var _masterPages = add ("checkbox", undefined, "");
                with (_masterPages) {
                  helpTip = localize(_global.masterPagesHelpTip);
                } // END iconbutton _masterPages
              } // end Icon: Musterseiten einbeziehen
              // Icon: Fußnoten einbeziehen
              try {
                if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                  var _footnotesIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x13\x00\x00\x00\x11\b\x06\x00\x00\x00?\u0098\u0097\u00C7\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00\u00C8IDATx\u00DAb\u00FC\u00FF\u00FF?\x03\u00B5\x00\x0B2\u0087\u0091\u0091q\u0099\u00BA\u00BAz$\u00B1\u009Ao\u00DE\u00BC\u00B9\x1C\u00E8\u0098(\u00B8~d\u0097ihh\u00FC\x0F\f\f$\u00DA%\u00EB\u00D7\u00AFg\u00B8q\u00E3\x06#V\u0097\u00C1\u0080\u00B3\u00B33A\u0083\u00F6\u00EE\u00DD\u008B\u00DF\u009B\u00C8`\u00C7\u008E\x1D\f,,\u00A8\u00D2\u00C0``\u00F8\u00F3\u00E7\x0F\u0083\u00BB\u00BB;\u00E10C\x06\x1E\x1E\x1E\u0094E\x0028t\u00E8\x10\x03\x13\x13\x13\u00D85\u00B0p\u00B5\u00B1\u00B1!\u00CF0;;;\u00EA\u00B9l\u00CF\u009E=X\u00C5]\\\\H7\f\u009F&\u0092\f\u00C3\x16\u00EDd\x19&--\u00CD\u00E0\u00E7\u00E7GP\u00E3\u00A6M\u009B\u0088\u00F7fff&N\u0083\u00A6O\u009F\u008EU\u009C\u0089\u0081\u008A\u0080\u0085T\u00DBI6\f[x\x10\x03PJ\rJ\u008B \u0080\x00\x03\x00\u0093;@\u00F2\u00AC\u0083\u009Cm\x00\x00\x00\x00IEND\u00AEB`\u0082"; 
                } else {  
                  var _footnotesIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x11\b\x06\x00\x00\x00\u00D0Z\u00FC\u00F9\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x00\u00F7IDATx\u00DA\u00AC\u0093M\x0E\u0083 \x10\u0085\u00A11q\u00D9\u009E\u00CA;x\x057\u00BA\u00D5\u00ADQ\u0097F\u00E3\u0089\u00BC\u0084\u00D7(\x1B\u00E3\u00BF\u00F5\u0091b\u00D0\u00B6b\r/!\x03\u00C8|\u0099\u00C7\b\u009D\u00E7\u0099\u00E8\u00D0\u008Dh\u0092!/\u00B2,\u00FB\u00AB<\u00CF\u00F3\x1EK`pe\u00EC?\u00BA\u00AE\u00FB3Q\u00BE\u0086<\u00CF\x11\x1E\u00EF%\u00DBXk\u00DBV\u008F5Y\u00BE\u00EF\u00F3H)\u00DDT\u0083\x18\u00C7\u00F1yP\u0092$\x1F\x00\u008Ci\u009A\u00C80\fj\u0090H\f\u0082`\u00B3\x1F\u0086!\u0087@J\x10l\bP\x14Ek\x15\u00A2\x12y\x1C\u0082D\u00D2~>\u008E\u00E3\n\u00DBw\u00EF+\u00C84MR\x14\u0085\u009E\u00AEY\u0096\u00C5\u00A3\u00B0\u0080\u00FB\u00C0\x10\u00EB\u00BE\u00EFI\u00D34\u00A4\u00AA\u00AAc\x10\x0EBi\u009A\u00AEv\u00845D@m\u00DBVW\u0084\u00C3\u0090\u00E38<\t`D\u00EC\u00E3\u0087\u00AD\u00EB\u009At]\u00A7\x06\u0095ey\u00E9\u008E\u00A8\u00DC\u0081\u00A5\u00FDw\u00E9\u00FD\u009C\u00D5sa\u00B0}E\u00EC\u00EA[{\t0\x00N\x16\u00C4\x0Bk\u00DB\u0090o\x00\x00\x00\x00IEND\u00AEB`\u0082"; 
                }
                var _footnotes = add ("iconbutton", undefined, _footnotesIcon, {style: "toolbutton", toggle: true});
                with (_footnotes) {
                  size = [20,19];
                  helpTip = localize(_global.footnotesHelpTip);
                } // END iconbutton _footnotes
              }
              catch (e) { 
                var _footnotes = add ("checkbox", undefined, "");
                with (_footnotes) {
                  helpTip = localize(_global.footnotesHelpTip);
                } // END iconbutton _footnotes
              } // end Icon: Fußnoten einbeziehen
              add ("statictext", undefined, localize(_global.placesStatictextLabel));
              var _places = add ("dropdownlist", undefined, [
						localize(_global.documentLabel), 
						localize(_global.storyLabel), 
						localize(_global.textframeLabel), 
						localize(_global.tablesLabel), 
						localize(_global.selectionLabel)
					]);
              with (_places) {
                selection = 0;
                minimumSize.width = 160;
              } // END dropdownlist _places
            } // END group _placesGroup
          } // END group _findPanelColumnLeft
          var _findPanelColumnRight = add ("group");       
          with (_findPanelColumnRight) {
            orientation = "column";
            spacing = 10;
            var _findButton = add ("button", undefined, localize(_global.findButtonLabel), { name: "ok" });
            var _exitButton = add ("button", undefined, localize(_global.exitButtonLabel));
            with (_exitButton) {
              alignment = "right";
            } // END button _exitButton
          } // END group _findPanelColumnRight
        } // END panel _findPanel    
        var _changePanel = add ("panel",undefined,"");    
        with (_changePanel) {
          orientation = "row";
          alignChildren = ["right","fill"];
          margins = [13,15,13,4];
          var _changePanelColumnLeft = add ("group");       
          with (_changePanelColumnLeft) { 
            orientation = "column";
            spacing = 5;
            var _changeGroup = add ("group");
            with (_changeGroup) {
              spacing = 0;
              margins.right = 2;
              add ("statictext", undefined, localize(_global.changeGrepStatictextLabel));
              var _changeGrep = add ("edittext", undefined, "", {multiline: false});
              with (_changeGrep) {           
                characters = 42;
              } // END edittext _changeGrep
              // Icon Sonderezeichen fuer Suche einfuegen
              try {
                if(app.scriptPreferences.version > 8 && app.generalPreferences.uiBrightnessPreference < 0.5) {
                  var _wildcardsChangeIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u0088IDATx\u00DA\u00ACT\u00BDJ\u00C3P\x18M\u00C5\u00CD\u00E4\x05\u00B2\u00B8%\x0F`\x1E }\u0081\u00CEb\u00E6\u00D2\u00C9E:\n\u00E2\x1E\x04\u00C1\u00A5tv\x17K\u00E7\x04\u00E7\u00F8\x00\u00E9,}\u0081\x1B7!\u009E\x03'r\u0089i\x12\u00B1\x1F\x1Cro\u00BE\u00EF;\u00F7\u00FB\u00BBwR\u00D7\u00B5sL9q\u008E,\u00A7}\u00CA\u00AA\u00AA\u00A6\u00F8\x04@\u00A8_\u00EF@\u00E6\u00BA\u00EE\u00FE\u0090\u00CF\u00A4+e\x10\u0091`)\u00A2\u00BD@\u0089\u00F4]\u0081\u00F4yT\u0084\"{\x00\fp\x03\u00C7\u00C2\u00D2y:h\u0081\u00B5\u0081\u00EE\u00B57B9\u00AC\u00B5\u009D\u00C3\u00C1\x1C(\x05\x0F\u00F4\u00A1\u00BF\x1Cj\u00CA\u008C\u0086@J28F\u00C0\x1A\u00D8\x02\u0089\u0088(\x1B\u00DAQ?D\x18\x03\x05\u00D3\u00841\u0089\u00EFu\x00k\u00B8\u00D0\u00DA\u0081>\u0093}8D\x18\u00AA\u0093\u0094+\u0080%\u00B8\x03\u00C1\\\u00FF\u00CA\u00D1sh\u0085_Z\x1D-\x15m\u00A3\u00DBY\u00B5\u00FE\u00F3`\u00FB\u00EA\u00B4\u00A3H\x1Dk|\u00A6\u00FAf}c\u00D3vf\u00A4lJ\u00A2\u00F4)\x01\u00F6\u008E\u00EA\u00D99\u00E0?\x11BY\u008A\u00F4\u00C2\u00EAd\u00E3\u00CCy\u00E3<&j\x14m\u00D3\u00CE\u00BC8\u0087\r\u008C1K\u00E0\r\b\u00B5\u00F7\tK\x1F\u00DA\u00FB.\u00B4\tI\u00B0\x05\u00D6\riK\u00EF5\u00EB,\u00CB6\u00C0y\u00DB\u00E6\u00D7]F\u008DfJ\u00D3S\u00D1\u00D9YW]\u00E7\u008C\u00AEh\u0097\u00E79\x1D?9V\u00C0c\x1C\u00C7_\u009Dw\u0099\u00F7\x13\u00A4\u0085\x1A\x11\u00A9\u00A3F5\u00DC\u00B5\u00CC\u00CFT\u00CB@At?_\u00EA^:\u00E2\u00F9\u00E3A\u00B7\u00C0\u00D3\u00A8\u00F7p@^\u0080k\u00A4\u00FA1\u00F8\x1E\u00FEG\u00BE\x05\x18\x00\u0090\x01\f\u00D98\u00AC\u00B5\x03\x00\x00\x00\x00IEND\u00AEB`\u0082";
                } else {
                  var _wildcardsChangeIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01\u0084IDATx\u00DA\u00ACT\u00B1J\u00C4@\x14L\u00E4:\u00CD\x0F\u00A4\u00B1K>\u00C0|\u0080\u00F7\x03\u00E9\u0092\u00C2\u00D4beg)\u0088\u00FDq \u00D8\x1CW\x1F\x1C\u00A9\u00C4pu\u00C0:~@\u00AE\u0096\u00FB\u0081`'\u00C4\x19\u0099@X\u00F7.A\u00EF\u00C1\u0090Mv\u00DEd\u00DF\u00BE\u00D9u\u00DB\u00B6u\u008E\x19'\u00CE\u0091crh\u00D2u\u00DD)\x1E\x01\x10\u00EA\u00D3;P\u00A2\u00AA\u00DD\u00DE\x1C[\u00C9\x10\u00A2\u00C0\u009D\u0084v\x02#\u00D2s\u0081\u00BC\u0095U\u0091\u0082}Hd\x03\u00AC)`\u00CCy\u00C0#\u00F0\x06\u00C4f\u00EE\x0F\u00C7\u0092\u00B0\x16<[\u0082xsrlsfSb\u00C0\x07f\u0098lPz\x04,\u0081\r\u0090\x01s\u00F1\n\u00F28?\u00D4\u00E5K\u00A0\u0082X\x05\u00B2\u00AF\u00F2|\u00ED\u00E1\u008D\u00C6\\I)~8$\x18\u00AA\u0093\u008C+m\u00C1\x03\x04\u00AE\u00F5\u00AD\x1E\u00ED\u00C3\u00DE\u00F2\u00EB^Gk\u00AD\u00B6\u009B\u00DB\u008A\u00EB\u00FD\u00C5\u00D8,\u00AF\u00D1\u00B8\x13\u00E8\u00EC3\u00D5\u00B3<dl3\u0099+eS2\u0095\u00CF\b\u00F0\u00EEh?\u00AD\x06\u009F\u00F4\u00FCX\u0083L\u00D1\x0B\u00FD\u00B9\u00D0\u009E2y\u00A5q&zE'\f\x1A[\u00A7\u0083\u00A6\r\u00F5\u00CE\u00B2}\u00C3\u00F4\u00FE>\x7F\u00DA\u008C\u00ED\u00EB\u0094,;Q\u00D3\u00F8\u00DD8I\u0092\x02879\u00BF\u00CE2\u00CA\u008EU\u00A6\u00A7\u00D2\u00D9\u00D93u\u009D\x1E]\u0090\u0097\u00A6)\x13?i+\u00E0)\u00CF\u00F3/\u00EBm\u0083\u0084W\u0088VjD\u00A4\u008E6\u00DA\u00B7\u00ADA?\u00D5^\x06Z\u0084\u00FD\u00FAR\u00F7f#\u00AE?\u00FE\u00E8\x1Ex\x1Eu\x1F\x0E\u00C4\x0Bp\u008BR?\x06\u00EF\u00C3\u00FF\u00C4\u00B7\x00\x03\x003\u00FC\x17\r\u00F9\u00EA\u00C2\u00F2\x00\x00\x00\x00IEND\u00AEB`\u0082";
                } 
                var _wildcardsChange = add ("iconbutton", undefined, _wildcardsChangeIcon, {style: "toolbutton"});
                with (_wildcardsChange) {
                  size = [22,22];
                  helpTip = localize(_global.wildcardsChangeHelpTip);
                } // END iconbutton _wildcardsChange
              }
              catch (e) { 
                var _wildcardsChange = add ("button", undefined, "@");
                with (_wildcardsChange) {
                  size = [22,23]
                  helpTip = localize(_global.wildcardsChangeHelpTip);
                } // END iconbutton _wildcardsChange
              } // END Icon Sonderezeichen einfuegen
            } // END group _changeGroup      
            var _changeFormatGroup = add ("group");
            with (_changeFormatGroup) {
              alignment = "right";
              margins.bottom = 0;
              margins.right = "27";
              // Icon: Refresh ChangeStyles
              try {
                var _refreshCangeStylesIcon = "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x11\b\x06\x00\x00\x00\u00D0Z\u00FC\u00F9\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x01=IDATx\u00DA\u00AC\u00D4=H\x03A\x10\u0086\u00E1\u00BDD4*\bZ*A\u00B1\u00B3Ke%b\u00A1\u00A0\x07\x01[\u0083\u0085\u00B5\bi\u00D2\u00A4\u00B6\u00B1\x14\x05{\x0B\x7FJA\u00B4\u00B3\u00B2S\u008BtV!\u0085\u00C4RA\u0088\x1A\u0089\u009E\u00EF\u0084\x11\u0086e\u00AF\u00F2\x16\x1E\b\u00BB\u00CBw\u00B7;sqI\u0092\u00B8\u00FF\x0E\u00C9\x18HY\u009B@\u008CyL\"\u00876\u00EEq\u00817\u00DD\u00B7\u00813\u00F9\x11IZ\x14E6d\x01;\x18\u00C5'\u009Ed\x1F\u008A\x18B\x07\x07\u0098F\x05\u00E5~\u0086\x17\u00B4\u0088\x1A\u00DEq\u008C\x1B|\u00E9\u00DA \u0096\u00B1\u0085a\u00F3\u00E0\u00B2\x7F\u00B4qlkH\x1D-\u00EF\u00B8\x12x\u00ADo\x12\u00FBwa\u0083f\u00D1\u00C3I \u00C4\u0099;\u0089C\x0B\u00FE\u00D1$X\u00CA\u00F8\x1D\u00D8+\u00F73\x17\u0098o\u00F4+\u009FU\u00F9s.\u00A3a\u00EF\u00A8\x14X\x7FD70\u009F\u00D7\u0096\u00E8\u0085\u0082v\u00BD\u00CD\u00D2h\u008D\u0094\x17X\u00C1&\u00F6\u00F1\u00E0\x07\u00D9!e>MY\u009B\u00D1^\u0092\u00D1\u00FC\u009BL\u00BB\u00A3%\u00ACi\x13:\u00D3\u0090\u00AB\u00D8\u00C3\b\u008E\u00F0\x1A*\u00FF%\u00CE\u00B5\u0087\u00AA\u00BA\u00B9\u00AB\u009FH\u00A2\u009FH\x01\x1F8\u00C4\u00AD\u00AD\u009A\r\u00AA\u0098\u00E3\u008Ca]?\u00DA)\u00FC\u00E0\x19w\u00B8\u00C2\u008B_~\u0097\u00E9\u00DFH\x16a\u00BF\x02\f\x00\u00BD/g\u00CDu\u00B8\u009C'\x00\x00\x00\x00IEND\u00AEB`\u0082";
                var _refreshChangeStyles = add ("iconbutton", undefined, _refreshCangeStylesIcon, {style: "toolbutton"});
                with (_refreshChangeStyles) {
                  size = [24,24];
                  helpTip = localize(_global._refreshChangeStylesHelpTip);
                } // END iconbutton _refreshChangeStyles
              }
              catch (e) { 
                var _refreshChangeStyles = add ("button", undefined, "R");
                with (_refreshChangeStyles) {
                  size = [24,24];
                  graphics.font = "dialog:11";
                  helpTip = localize(_global._refreshChangeStylesHelpTip);
                } // END button _refreshChangeStyles
              } // end Icon: Refresh ChangeStyles   
              var _changeCharacterStyles = add ("dropdownlist", undefined, _doc.characterStyles.everyItem().name);
              with (_changeCharacterStyles) {
                graphics.font = "dialog:11";
                graphics.foregroundColor = graphics.newPen (graphics.PenType.SOLID_COLOR, [0.13, 0.13, 0.13], 1);
                maximumSize.width = 165;
              } // END dropdownlist _changeCharacterStyles
              var _changeParagraphStyles = add ("dropdownlist", undefined, _doc.paragraphStyles.everyItem().name);
              with (_changeParagraphStyles) {
                graphics.font = "dialog:11";
                graphics.foregroundColor = graphics.newPen (graphics.PenType.SOLID_COLOR, [0.13, 0.13, 0.13], 1);
                maximumSize.width = 160;
              } // END dropdownlist _changeParagraphStyles
              writeStyleItems (_changeCharacterStyles, _changeParagraphStyles);
            } // END group _changeFormatGroup         
          } // END group _changePanelColumnLeft  
          var _changePanelColumnRight = add ("group");       
          with (_changePanelColumnRight) { 
            alignment = "fill";
            alignChildren = "top";
            var _changeButton = add ("button", undefined, localize(_global.changeButtonLabel));
            with (_changeButton) {
              helpTip = localize(_global.changeButtonHelpTip);
            } // END button _changeButton
          } // END group _changePanelColumnRight       
        } // END panel _changePanel         
      } // END group _columnRight
    } // END window _palette
	 
	 
    /* Callbacks */
    _inputGrep.onChanging = function() { 
      __initiateSearch ();
    }

    // Sonderzeichen fuer Suche einfuegen
    _wildcardsFind.onClick = function () {
		
      var _textselection = _inputGrep.textselection;
      if (_inputGrep.active == true && _textselection !== "") { 
			_inputGrep.textselection = "(?#textselection?)";
      } else {
        _inputGrep.text += "(?#textselection?)";
      }
      var _selectedWildcardForFind = __getWildcardsForFind ();     
      if (_selectedWildcardForFind!="") {
        switch (_selectedWildcardForFind) {
          case "()" :
            _textselection = "("+_textselection+")";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;
          case "(?:)" :
            _textselection = "(?:"+_textselection+")";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;
          case "[]" :
            _textselection = "["+_textselection+"]";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;
          case "[^]" :
            _textselection = "[^"+_textselection+"]";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;         
          case "(?<=)" :
            _textselection = "(?<="+_textselection+")";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;
          case "(?<!)" :
            _textselection = "(?<!"+_textselection+")";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;
          case "(?=)" :
            _textselection = "(?="+_textselection+")";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;
          case "(?!)" :
            _textselection = "(?!"+_textselection+")";
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            break;         
          case "(?#comment?)" :
            if (_textselection!="") {
              _textselection = "(?#"+_textselection+"?)";
              _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
            } else {
              _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_selectedWildcardForFind);
            }
            break;
          default :
            _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_selectedWildcardForFind);
        } // END switch _selectedWildcardForFind
      } else {
        _inputGrep.text = _inputGrep.text.replace(/\(\?#textselection\?\)/,_textselection);
      } 
      __initiateSearch ();
    }
    
    // Sonderzeichen fuer Ersetzung einfuegen
    _wildcardsChange.onClick = function () {  
		       
      var _textselection = _changeGrep.textselection;
      if (_changeGrep.active == true && _textselection !== "") {   
        _changeGrep.textselection = "(?#textselection?)";
      } else {
        _changeGrep.text += "(?#textselection?)";
      }
      var _selectedWildcardForChange = __getWildcardsForChange ();
      if (_selectedWildcardForChange!="") {
        _changeGrep.text = _changeGrep.text.replace(/\(\?#textselection\?\)/,_selectedWildcardForChange);
      } else {
        _changeGrep.text = _changeGrep.text.replace(/\(\?#textselection\?\)/,_textselection);     
      } 
    }

    _findCharacterStyles.onChange = function() { 
      __initiateSearch ();
    }
  
    _findParagraphStyles.onChange = function() { 
      __initiateSearch ();
    }
  
    _places.onChange = function() { 
      __initiateSearch ();     
    } 
  
    // Initiate Search if Live-Modus is on
    function __initiateSearch () {
      _sc = 0;
      if (_live.value == true) {
        var _onChangeCondition = true;
        var _findOrChange = "find";
        _hits = _getGrep (_onChangeCondition, _findOrChange); 
        if (_hits == null) _numberOfHits.text = 0; else _numberOfHits.text = _hits; 
      } else { 
        _onChangeCondition = false;    
      }
    }
  
    _findButton.onClick = function() { 
      if(!alertConditionalText()) {
			return false;
		} 
      _sc = 0;
      var _onClickCondition = true;
      var _findOrChange = "find";
      _hits = _getGrep (_onClickCondition, _findOrChange); 
		if (_hits == null){ 
			_numberOfHits.text = 0; 
		} else { 
			_numberOfHits.text = _hits; 
		}
    }  
  
    _changeButton.onClick = function() { 
      if(!alertConditionalText()) {
			return false;
		} 
      _sc = 0;
      var _onClickCondition = true;
      var _findOrChange = "change";
   	_getGrep (_onClickCondition, _findOrChange); 
      _findButton.notify();
    } 
  
    _copyButton.onClick = function ()  {
      app.doScript(copyButtonOnClick, ScriptLanguage.JAVASCRIPT , [], UndoModes.ENTIRE_SCRIPT, localize(_global.copyMatchesUndoLabel));
      function copyButtonOnClick () {
        var _resultStrings = [];     
        var _resultsToCopy = findHits ();   
        if (_resultsToCopy.length > 0) {           
				for (var i=0; i<_resultsToCopy.length; i++) {   
				_resultStrings.push(_resultsToCopy[i].contents);        
				}   
				var _textForClipboard = _resultStrings.join("\t");
				var _firstPage = app.activeDocument.pages[0];
				try {
				var _tempLayer = app.activeDocument.layers.add({name:"::tempLayer::"});
				_tempLayer.visible = false;
				var _tempTF = app.activeDocument.textFrames.add(_tempLayer,undefined,_firstPage, {name:"::tempTF::"});
				var _firstPageBounds = _firstPage.bounds;
				_tempTF.visibleBounds = _firstPageBounds; 
				_tempTF.contents = _textForClipboard;      
				app.activeDocument.select(_tempTF.texts);
				app.copy(); 
				alert(localize(_global.copyMatchesAlertMessage) + "\r" + _textForClipboard);
				} catch (e) { 
					_copyFailed (); 
				} 
				try { 
					_tempTF.remove();
					_tempLayer.remove();
				} catch (e) { 
					_copyFailed (); 
				} 
        } else {
          _copyFailed ();
        }
       
        function _copyFailed () {
          alert(localize(_global.failedCopyAlertMessage)); 
        }
      }
    }
  
    _selectionButton.onClick = function ()  {  
      var _resultsToSelect = findHits ();
      if (_resultsToSelect.length > 0) {
        if (_sc >= _resultsToSelect.length) { 
          _sc = 0; 
        }
        try { 
				showIt (_resultsToSelect[_sc]); 
			} catch (e) { 
				alert (localize(_global.matchInOversetAlertMessage)); 
			} // showIt: Fehler bei Übersatztext
        _sc += 1;
        if (_sc >= _resultsToSelect.length && _resultsToSelect.length > 1) { 
			  alert (localize(_global.lastMatchAlertMessage)); 
			}
      } else {
        alert(localize(_global.noMatchAlertMessage));
      }       
    }

    _clearConditionButton.onClick = function ()  {
      _sc = 0;
      delConditions (); 
    }
  
    _refreshFindStyles.onClick = function () {  
      var _checkLiveValue = _live.value;
      if (_checkLiveValue) {
        _live.value = false;
      }
      writeStyleItems (_findCharacterStyles, _findParagraphStyles);
      _live.value = _checkLiveValue;
    }
  
    _refreshChangeStyles.onClick = function () {         
      writeStyleItems (_changeCharacterStyles, _changeParagraphStyles);
    }
  
    _exitButton.onClick = function ()  {
      delConditionsInAllDocs (); 
      _palette.close(0);
    }
  
    _palette.onClose = function () {
      _sc = 0;
      delConditionsInAllDocs ();
    }
    /* END Callbacks */
  
    function writeStyleItems (_cStyles, _pStyles) { 
      
      var _doc = app.activeDocument;
      with (_cStyles) {        
          removeAll();
          add ("item", localize(_global.emptyCharacterStyleLabel), 0);
          add ("separator", undefined, 1);
          for (var i=0; i<_doc.allCharacterStyles.length; i++) { 
            var _cs = _doc.allCharacterStyles[i];
            if (_cs.parent.constructor.name == "CharacterStyleGroup") {            
              if (_cs.parent.parent.constructor.name == "CharacterStyleGroup") {
                add ("item", _cs.parent.parent.name + " > " + _cs.parent.name + " > " + _cs.name); 
                _cs.label = _cs.parent.parent.name + " > " + _cs.parent.name + " > " + _cs.name;
              } else { 
                add ("item", _cs.parent.name + " > " + _cs.name);
                _cs.label = _cs.parent.name + " > " + _cs.name;
              }
            } else {  
              add ("item", _cs.name);
              _cs.label = _cs.name;
            }
          }
          selection = 0;
        } 
      with (_pStyles) {     
        removeAll();
        add ("item", localize(_global.emptyParagraphStyleLabel), 0);
        add ("separator", undefined, 1);
        for (var j=0; j<_doc.allParagraphStyles.length; j++) {
          var _ps = _doc.allParagraphStyles[j];
          if (_ps.parent.constructor.name == "ParagraphStyleGroup") {            
            if (_ps.parent.parent.constructor.name == "ParagraphStyleGroup") {
              add ("item", _ps.parent.parent.name + " > " + _ps.parent.name + " > " + _ps.name); 
              _ps.label = _ps.parent.parent.name + " > " + _ps.parent.name + " > " + _ps.name;
            } else { 
              add ("item", _ps.parent.name + " > " + _ps.name);
              _ps.label = _ps.parent.name + " > " + _ps.name;
            }
          } else {  
              add ("item", _ps.name);
              _ps.label = _ps.name;
          }  
        }
        selection = 0;
      }
    }
  
  
    function _getGrep (_condition, _findOrChange) { 
      
      // Hervorhebung (bedingeter Text) ist im Vorschau-Modus nicht sichtbar 
      app.activeDocument.layoutWindows[0].screenMode = ScreenModeOptions.previewOff;
      
      var _doc = app.activeDocument;
      var _input = _inputGrep.text;
      var _change = _changeGrep.text;
      var _place = _places.selection.text;
      
      switch (_place) {
        case "Textabschnitt" :
            try {
              _place = _doc.selection[0].insertionPoints[0].parentStory;
            } catch(e) { _place = null; /*alert("Place, Zuordnung, Textabschnitt: " + e + "Zeile: " + e.line);*/ }        
          break;
        case "Textrahmen" :
          try {
            _place = _doc.selection[0].insertionPoints[0].parentTextFrames[0];
          } catch(e) { _place = null; /*alert("Place, Zuordnung, Textrahmen: " + e + "Zeile: " + e.line);*/ }
          break;
        case "Tabellen" :
          try {
				 /* Nicht in Fußnoten! */
            _place = _doc.stories.everyItem().tables.everyItem();
          } catch(e) { _place = null; /*alert("Place, Zuordnung, Tabellen: " + e + "Zeile: " + e.line);*/ }
          break;
        case "Auswahl" :
          if (((app.selection.length > 0)&&(app.selection[0].constructor.name != "InsertionPoint"))&&
              ((app.selection[0].hasOwnProperty ("baseline"))||(app.selection[0].constructor.name == "TextFrame")||(app.selection[0].constructor.name == "Table"))) {    
            try {
              _place = app.selection[0];
            } catch(e) { _place = null; /*alert("Place, Zuordnung, Auswahl: " + e + "Zeile: " + e.line);*/ }
          } else { _place = null; } 
          break;      
        default :
          _place = _doc;
      }    
      
      if (_condition && (_place != null)) {
        var _findCharacterStyle = _findCharacterStyles.selection.text;
        if (_findCharacterStyle == localize(_global.emptyCharacterStyleLabel)) {
          _findCharacterStyle = "";
        } else {
          if (app.activeDocument.characterStyles.itemByLabel(_findCharacterStyle)!=null) {
            _findCharacterStyle = app.activeDocument.characterStyles.itemByLabel(_findCharacterStyle);
          } else {
            alert(localize(_global.refreshCharacterStyleLabel,_findCharacterStyle));
            _findCharacterStyle = "";       
          }  
        }
        var _findParagraphStyle = _findParagraphStyles.selection.text;
        if (_findParagraphStyle == localize(_global.emptyParagraphStyleLabel)) {
          _findParagraphStyle = "";
        } else {
          if (app.activeDocument.paragraphStyles.itemByLabel(_findParagraphStyle)!=null) {
            _findParagraphStyle = app.activeDocument.paragraphStyles.itemByLabel(_findParagraphStyle);  
          } else {
            alert(localize(_global.refreshParagraphStyleLabel,_findParagraphStyle));
            _findParagraphStyle = "";  
          }
        }        
        if (_findOrChange == "change") {
          var _changeCharacterStyle = _changeCharacterStyles.selection.text;
          if (_changeCharacterStyle == localize(_global.emptyCharacterStyleLabel)) {
            _changeCharacterStyle = "";
          } else {    
            if (app.activeDocument.characterStyles.itemByLabel(_changeCharacterStyle)!=null) {
              _changeCharacterStyle = app.activeDocument.characterStyles.itemByLabel(_changeCharacterStyle);
            } else {
              alert(localize(_global.refreshCharacterStyleLabel,_changeCharacterStyle));
              _changeCharacterStyle = _findCharacterStyle; 
            }  
          }
          var _changeParagraphStyle = _changeParagraphStyles.selection.text;
          if (_changeParagraphStyle == localize(_global.emptyParagraphStyleLabel)) {
            _changeParagraphStyle = "";
          } else {
            if (app.activeDocument.paragraphStyles.itemByLabel(_changeParagraphStyle)!=null) {
             _changeParagraphStyle = app.activeDocument.paragraphStyles.itemByLabel(_changeParagraphStyle); 
            } else {
              alert(localize(_global.refreshParagraphStyleLabel,_changeParagraphStyle));
              _changeParagraphStyle = _findParagraphStyle;  
            }  
          } 
        } else {   
          _change = "";
          _changeCharacterStyle = "";
          _changeParagraphStyle = ""; 
        }
        
        _searchOption = [_hiddenLayers.value, _masterPages.value, _footnotes.value];
        
        if ((_input != "")||(_findCharacterStyle!= "")||(_findParagraphStyle!= "")) {
          var _hits = findChangeGrep (_findOrChange, _input, _change, _findCharacterStyle, _changeCharacterStyle, _findParagraphStyle, _changeParagraphStyle, _place, _searchOption);
        } else {
          delConditions ();
        }
      } else {
        delConditions (); 
      }
      return _hits;
    }
  } // end if _palette==null /* refresh UI */ 
  return _palette;
}


function __getWildcardsForFind() {

	var _item;

	// Wildcards Dialog for Search
	var _selectWildcardsForFind = new Window ("dialog",localize({"de":"Sonderzeichen für Suche","en":"Wildcards for Search"}));
	with (_selectWildcardsForFind) {
	  alignChildren = "right";

	  var _wildcardsForFindTree = add ("treeview");
	  with (_wildcardsForFindTree) {
			preferredSize = [380,430];
			itemSize = [560,20];
			_item = add("item",localize({"de":"Tabulator: \\t","en":"Tab Character: \\t"}));
			_item.grep = "\\t"; 
			_item = add("item",localize({"de":"Harter Zeilenumbruch: \\n","en":"Forced Line Break: \\n"}));
			_item.grep = "\\n";
			_item = add("item",localize({"de":"Absatzende: \\r","en":"End of Paragraph: \\r"}));
			_item.grep = "\\r";
		 
		 // Symbole
		 var _symbols = add ("node",localize({"de":"Symbole","en":"Symbols"}));
		 with (_symbols) {
			_item = add("item",localize({"de":"Leerzeichen (über die Schriftart definiert): [ ]","en":"Space (Defined by the font): [ ]"}));
			_item.grep = "[ ]";
			_item = add("item",localize({"de":"Aufzählungszeichen: ~8","en":"Bullet Character: ~8"}));
			_item.grep = "~8";
			_item = add("item",localize({"de":"Umgekehrter Schrägstrich: \\\\","en":"Backslash Character: \\\\"}));
			_item.grep = "\\\\";
			_item = add("item",localize({"de":"Caret-Zeichen: \\^","en":"Caret Character: \\^"}));
			_item.grep = "\\^";
			_item = add("item",localize({"de":"Copyright-Symbol: ~2","en":"Copyright Symbol: ~2"}));
			_item.grep = "~2";
			_item = add("item",localize({"de":"Auslassungszeichen (Ellipse): ~e","en":"Ellipsis: ~e"}));
			_item.grep = "~e";
			_item = add("item",localize({"de":"Absatzmarke: ~7","en":"Paragraph Symbol: ~7"}));
			_item.grep = "~7";
			_item = add("item",localize({"de":"Eingetragene Marke: ~r","en":"Registered Trademark Symbol: ~r"}));
			_item.grep = "~r";
			_item = add("item",localize({"de":"Paragraphenzeichen: ~6","en":"Section Symbol: ~6"}));
			_item.grep = "~6";
			_item = add("item",localize({"de":"Trademark-Symbol: ~d","en":"Trademark Symbol: ~d"}));
			_item.grep = "~d";
			_item = add("item",localize({"de":"Runde Klammer auf: \\(","en":"Open Parenthesis Character: \\("}));
			_item.grep = "\\(";
			_item = add("item",localize({"de":"Runde Klammer zu: \\)","en":"Close Parenthesis Character: \\)"}));
			_item.grep = "\\)";
			_item = add("item",localize({"de":"Geschweifte Klammer auf: \\{","en":"Close Brace Character: \\{"}));
			_item.grep = "\\{";
			_item = add("item",localize({"de":"Geschweifte Klammer zu: \\}","en":"Open Brace Character: \\}"}));
			_item.grep = "\\}";
			_item = add("item",localize({"de":"Eckige Klammer auf: \\[","en":"Open Bracket Character: \\["}));
			_item.grep = "\\[";
			_item = add("item",localize({"de":"Eckige Klammer zu: \\]","en":"Close Bracket Character: \\]"}));
			_item.grep = "\\]";
		 }

		 // Marken
		 var _marks = add ("node",localize({"de":"Marken","en":"Marks"}));
		 with (_marks) {
			_item = add("item",localize({"de":"Alle Seitenzahlen: ~#","en":"Any Page Number: ~#"}));
			_item.grep = "~#";
			_item = add("item",localize({"de":"Aktuelle Seitenzahl: ~N","en":"Current Page Number: ~N"}));
			_item.grep = "~N";
			_item = add("item",localize({"de":"Nächste Seitenzahl: ~X","en":"Next Page Number: ~X"}));
			_item.grep = "~X";
			_item = add("item",localize({"de":"Vorherige Seitenzahl: ~V","en":"Previous Page Number: ~V"}));
			_item.grep = "~V";
			_item = add("item",localize({"de":"Abschnittsmarke: ~x","en":"Section Marker: ~x"}));
			_item.grep = "~x";
			_item = add("item",localize({"de":"Marke für verankertes Objekt: ~a","en":"Anchored Object Marker: ~a"}));
			_item.grep = "~a";
			_item = add("item",localize({"de":"Marke für Fußnotenverweis: ~F","en":"Footnote Reference Marker: ~F"}));
			_item.grep = "~F";
			_item = add("item",localize({"de":"Indexmarke: ~I","en":"Index Marker: ~I"}));
			_item.grep = "~I";
			_item = add("item",localize({"de":"Verschachteltes Format hier beenden: ~h","en":"End Nested Style Here: ~h"}));
			_item.grep = "~h";
		 }

		 // Trenn- und Gedankenstriche
		 var _dashes = add ("node",localize({"de":"Trenn- und Gedankenstriche","en":"Hyphens and Dashes"}));
		 with (_dashes) {
			_item = add("item",localize({"de":"Geviertstrich: ~_","en":"Em Dash: ~_"}));
			_item.grep = "~_";
			_item = add("item",localize({"de":"Halbgeviertstrich: ~=","en":"En Dash: ~="}));
			_item.grep = "~=";
			_item = add("item",localize({"de":"Bindestrich: \\-","en":"Hyphen: \\-"}));
			_item.grep = "\\-";
			_item = add("item",localize({"de":"Bedingter Trennstrich: ~-","en":"Discretionary Hyphen: ~-"}));
			_item.grep = "~-";
			_item = add("item",localize({"de":"Geschützter Trennstrich: ~~","en":"Nonbreaking Hyphen: ~~"}));
			_item.grep = "~~";
		 }

		 // Leerraum
		 var _spaces = add ("node",localize({"de":"Leerraum","en":"Spaces"}));
		 with (_spaces) {
			_item = add("item",localize({"de":"Geviert: ~m","en":"Em Space: ~m"}));
			_item.grep = "~m";
			_item = add("item",localize({"de":"Halbgeviert: ~>","en":"En Space: ~>"}));
			_item.grep = "~>";
			_item = add("item",localize({"de":"Drittelgeviert: ~3","en":"Third Space: ~3"}));
			_item.grep = "~3";
			_item = add("item",localize({"de":"Viertelgeviert: ~4","en":"Quarter Space: ~4"}));
			_item.grep = "~4";
			_item = add("item",localize({"de":"Sechstelgeviert: ~%","en":"Sixth Space: ~%"}));
			_item.grep = "~%";
			_item = add("item",localize({"de":"Achtelgeviert: ~<","en":"Thin Space: ~<"}));
			_item.grep = "~<";
			_item = add("item",localize({"de":"Ausgleichsleerzeichen: ~f","en":"Flush Space: ~f"}));
			_item.grep = "~f";
			_item = add("item",localize({"de":"1/24-Geviert: ~|","en":"Hair Space: ~|"}));
			_item.grep = "~|";
			_item = add("item",localize({"de":"Geschützes Leerzeichen: ~S","en":"Nonbreaking Space: ~S"}));
			_item.grep = "~S";
			_item = add("item",localize({"de":"Geschütztes Leerzeichen (feste Breite): ~s","en":"Nonbreaking Space (fixed width): ~s"}));
			_item.grep = "~s";
			_item = add("item",localize({"de":"Interpunktionsleerzeichen: ~.","en":"Punctuation Space: ~."}));
			_item.grep = "~.";
			_item = add("item",localize({"de":"Ziffernleerzeichen: ~/","en":"Figure Space: ~/"}));
			_item.grep = "~/";
		 }

		 // Anführungszeichen
		 var _puntuation = add ("node",localize({"de":"Anführungszeichen","en":"Quotation Marks"}));
		 with (_puntuation) {
			_item = add("item",localize({"de":"Alle doppelten Anführungszeichen: \"","en":"Any Double Quotation Mark: \""}));
			_item.grep = "\"";
			_item = add("item",localize({"de":"Alle einfachen Anführungszeichen (Apostroph): \'","en":"Any Single Quotation Mark (Apostrophe): \'"}));
			_item.grep = "\'";
			_item = add("item",localize({"de":"Gerade doppelte Anführungszeichen: ~\"","en":"Straight Double Quotation Mark: ~\""}));
			_item.grep = "~\"";
			_item = add("item",localize({"de":"Öffnende doppelte Anführungszeichen: ~{","en":"Double Left Quotation Mark: ~{"}));
			_item.grep = "~{";
			_item = add("item",localize({"de":"Schließende doppelte Anführungszeichen: ~}","en":"Double Right Quotation Mark: ~}"}));
			_item.grep = "~}";
			_item = add("item",localize({"de":"Gerades einfaches Anführungszeichen (Apostroph): ~\'","en":"Straight Single Quotation Mark (Apostrophe): ~\'"}));
			_item.grep = "~\'";
			_item = add("item",localize({"de":"Öffnendes einfaches Anführungszeichen: ~[","en":"Single Left Quotation Mark: ~["}));
			_item.grep = "~[";
			_item = add("item",localize({"de":"Schließendes einfaches Anführungszeichen: ~]","en":"Single Right Quotation Mark: ~]"}));
			_item.grep = "~]";
		 }

		 // Umbruchzeichen
		 var _breaks = add ("node",localize({"de":"Umbruchzeichen","en":"Break Characters"}));
		 with (_breaks) {
			_item = add("item",localize({"de":"Alle Umbruchzeichen (außer harter Zeilenumbruch): \\r","en":"All Break Character (except Forced Line Break): \\r"}));
			_item.grep = "\\r";
			_item = add("item",localize({"de":"Standardzeilenumbruch: ~b","en":"Standard carriage return: ~b"}));
			_item.grep = "~b";
			_item = add("item",localize({"de":"Spaltenumbruch: ~M","en":"Column Break: ~M"}));
			_item.grep = "~M";
			_item = add("item",localize({"de":"Rahmenumbruch: ~R","en":"Frame Break: ~R"}));
			_item.grep = "~R";
			_item = add("item",localize({"de":"Seitenumbruch: ~P","en":"Page Break: ~P"}));
			_item.grep = "~P";
			_item = add("item",localize({"de":"Umbruch für ungerade Seiten: ~L","en":"Odd Page Break: ~L"}));
			_item.grep = "~L";
			_item = add("item",localize({"de":"Umbruch für gerade Seiten: ~E","en":"Even Page Break: ~E"}));
			_item.grep = "~E";
			_item = add("item",localize({"de":"Bedingter Zeilenumbruch: ~k","en":"Discretionary Line Break: ~k"}));
			_item.grep = "~k";
		 }

		 // Variable
		 var _variables = add ("node",localize({"de":"Variable","en":"Variables"}));
		 with (_variables) {
			_item = add("item",localize({"de":"Alle Variablen: ~v","en":"Any Variable: ~v"}));
			_item.grep = "~v";
			_item = add("item",localize({"de":"Lebender Kolumnentitel (Absatzformat): ~Y","en":"Running header (paragraph style) variable: ~Y"}));
			_item.grep = "~Y";
			_item = add("item",localize({"de":"Lebender Kolumnentitel (Zeichenformat): ~Z","en":"Running header (character style) variable: ~Z"}));
			_item.grep = "~Z";
			_item = add("item",localize({"de":"Benutzerdefinierter Text: ~u","en":"Custom text variable: ~u"}));
			_item.grep = "~u";
			_item = add("item",localize({"de":"Alle Seitenzahlen: ^#","en":"Any Page Number: ^#"}));
			_item.grep = "^#";
			_item = add("item",localize({"de":"Aktuelle Seitenzahl: ~N","en":"Current Page Number: ~N"}));
			_item.grep = "~N";
			_item = add("item",localize({"de":"Nächste Seitenzahl: ^X","en":"Next Page Number: ^X"}));
			_item.grep = "^X";
			_item = add("item",localize({"de":"Vorherige Seitenzahl: ^V","en":"Previous Page Number: ^V"}));
			_item.grep = "^V";
			_item = add("item",localize({"de":"Letzte Seitenzahl: ~T","en":"Last page number: ~T"}));
			_item.grep = "~T";
			_item = add("item",localize({"de":"Abschnittsmarke: ^x","en":"Section mark: ^x"}));
			_item.grep = "^x";
			_item = add("item",localize({"de":"Kapitelnummer: ~H","en":"Chapter number: ~H"}));
			_item.grep = "~H";
			_item = add("item",localize({"de":"Erstellungsdatum: ~O","en":"Creation date variable: ~O"}));
			_item.grep = "~O";
			_item = add("item",localize({"de":"Änderungsdatum: ~o","en":"Modification date variable: ~o"}));
			_item.grep = "~o";
			_item = add("item",localize({"de":"Ausgabedatum: ~D","en":"Output date variable: ~D"}));
			_item.grep = "~D";
			_item = add("item",localize({"de":"Dateiname: ~l","en":"File name variable: ~l"}));
			_item.grep = "~l";
			_item = add("item",localize({"de":"Metadatenbeschriftung: ~J","en":"Metadata Labeling: ~J"}));
			_item.grep = "~J";
		 }

		 // Andere 
		 var _others = add ("node",localize({"de":"Andere","en":"Other"}));
		 with (_others) {
			_item = add("item",localize({"de":"Tabulator für rechte Ausrichtung: ~y","en":"Right Indent Tab: ~y"}));
			_item.grep = "~y";
			_item = add("item",localize({"de":"Einzug bis hierhin: ~i","en":"Indent to Here: ~i"}));
			_item.grep = "~i";
			_item = add("item",localize({"de":"Verschachteltes Format beenden: ~h","en":"End Nested Style Here: ~h"}));
			_item.grep = "~h";
			_item = add("item",localize({"de":"Verbindung unterdrücken: ~j","en":"Nonjoiner: ~j"}));
			_item.grep = "~j";
		 }

		 // Platzhalter
		 var _placeholders = add ("node",localize({"de":"Platzhalter","en":"Placeholder"}));
		 with (_placeholders) {
			_item = add("item",localize({"de":"Beliebige Ziffer: \\d","en":"Any Digit: \\d"}));
			_item.grep = "\\d";
			_item = add("item",localize({"de":"Beliebiges Zeichen außer Ziffer: \\D","en":"Any character that is not a digit: \\D"}));
			_item.grep = "\\D";
			_item = add("item",localize({"de":"Beliebiger Buchstabe: [\\u\\l]","en":"Any Letter: [\\u\\l]"}));
			_item.grep = "[\\u\\l]";
			_item = add("item",localize({"de":"Beliebiges Zeichen: .","en":"Any Character: ."}));
			_item.grep = ".";
			_item = add("item",localize({"de":"Beliebiges Zeichen (inklusive Umbruchzeichen): \\X","en":"Any Character (inclusive all Break Character): \\X"}));
			_item.grep = "\\X";
			_item = add("item",localize({"de":"Alle Leerräume: \\s","en":"White Space (any space or tab): \\s"}));
			_item.grep = "\\s";
			_item = add("item",localize({"de":"Horizontale Leerräume: \\h","en":"Horizontal Whitespaces: \\h"}));
			_item.grep = "\\h";
			_item = add("item",localize({"de":"Vertikale Leerräume: \\v","en":"Vertical Whitespaces: \\v"}));
			_item.grep = "\\v";
			_item = add("item",localize({"de":"Beliebiges Zeichen außer Leerraum: \\S","en":"Any character that is not a white space: \\S"}));
			_item.grep = "\\S";
			_item = add("item",localize({"de":"Alle Wortzeichen: \\w","en":"Any word character: \\w"}));
			_item.grep = "\\w";
			_item = add("item",localize({"de":"Beliebiges Zeichen außer Wortzeichen: \\W","en":"Any character that is not a word character: \\W"}));
			_item.grep = "\\W";
			_item = add("item",localize({"de":"Alle Großbuchstaben: \\u","en":"Any uppercase letter: \\u"}));
			_item.grep = "\\u";
			_item = add("item",localize({"de":"Beliebiges Zeichen außer Großbuchstabe: \\U","en":"Any character that is not an uppercase letter: \\U"}));
			_item.grep = "\\U";
			_item = add("item",localize({"de":"Alle Kleinbuchstaben: \\l","en":"Any lowercase letter: \\l"}));
			_item.grep = "\\l";
			_item = add("item",localize({"de":"Beliebiges Zeichen außer Kleinbuchstabe: \\L","en":"Any character that is not a lowercase letter: \\L"}));
			_item.grep = "\\L";
			_item = add("item",localize({"de":"Alle Umbruchzeichen: \\r","en":"All Break Character (except Forced Line Break): \\r"}));
			_item.grep = "\\r";
		 }

		 // Eigene Zeichenklasse
		 var _characterClass = add ("node",localize({"de":"Eigene Zeichenklasse","en":"Own Character Set"}));
		 with (_characterClass) {
			_item = add("item",localize({"de":"Alle Zeichen innerhalb der eckigen Klammer: []","en":"Character Set: []"}));
			_item.grep = "[]";
			_item = add("item",localize({"de":"Eigene Zeichenklasse negieren: [^]","en":"Negate Own Character Set: [^]"}));
			_item.grep = "[^]";
		 }

		 // Unicode
		 var _unicode = add ("node",localize({"de":"Unicode","en":"Unicode"}));
		 with (_unicode) {
			_item = add("item",localize({"de":"Unicode-Codepoint: \\x{####}","en":"Unicode-Codepoint: \\x{####}"}));
			_item.grep = "\\x{####}";
			_item = add("item",localize({"de":"Unicode-Name 1: \\N{Unicode-Name}","en":"Unicode-Name 1: \\N{Unicode-Name}"}));
			_item.grep = "\\N{Unicode-Name}";
			_item = add("item",localize({"de":"Unicode-Name 2: [[.Unicode-Name.]]","en":"Unicode-Name 2: [[.Unicode-Name.]]"}));
			_item.grep = "[[.Unicode-Name.]]";
		 }

		 // Positionen
		 var _position = add ("node",localize({"de":"Positionen","en":"Locations"}));
		 with (_position) {
			_item = add("item",localize({"de":"Absatzbeginn: ^","en":"Beginning of paragraph: ^"}));
			_item.grep = "^";
			_item = add("item",localize({"de":"Absatzende: $","en":"End of Paragraph: $"}));
			_item.grep = "$";
			_item = add("item",localize({"de":"Wortbeginn: \\<","en":"Beginning of Word: \\<"}));
			_item.grep = "\\<";
			_item = add("item",localize({"de":"Wortende: \\>","en":"End of Word: \\>"}));
			_item.grep = "\\>";
			_item = add("item",localize({"de":"Wortgrenze: \\b","en":"Word Boundary: \\b"}));
			_item.grep = "\\b";
			_item = add("item",localize({"de":"Keine Wortgrenze: \\B","en":"Opposite of Word Boundary: \\B"}));
			_item.grep = "\\B";
			_item = add("item",localize({"de":"Anfang des Textabschnittes: \\A","en":"Beginning of Story: \\A"}));
			_item.grep = "\\A";
			_item = add("item",localize({"de":"Ende des Textabschnittes: \\Z","en":"End of Story: \\Z"}));
			_item.grep = "\\Z";
		 }

		 // Wiederholung
		 var _repeatings = add ("node",localize({"de":"Wiederholung","en":"Repetitions"}));
		 with (_repeatings) {
			_item = add("item",localize({"de":"Null oder ein Mal: ?","en":"Zero or One Time: ?"}));
			_item.grep = "?";
			_item = add("item",localize({"de":"Null oder mehrere Male: *","en":"Zero or More Times: *"}));
			_item.grep = "*";
			_item = add("item",localize({"de":"Ein oder mehrere Male: +","en":"One or More Times: +"}));
			_item.grep = "+";
			_item = add("item",localize({"de":"Null oder ein Mal (kürzeste Entsprechung): ??","en":"Zero or One Time (Shortest Match): ??"}));
			_item.grep = "??";
			_item = add("item",localize({"de":"Null oder mehrere Male (kürzeste Entsprechung): *?","en":"Zero or More Times (Shortest Match): *?"}));
			_item.grep = "*?";
			_item = add("item",localize({"de":"Ein oder mehrere Male (kürzeste Entsprechung): +?","en":"One or More Times (Shortest Match): +?"}));
			_item.grep = "+?";
			_item = add("item",localize({"de":"n-mal: {n}","en":"n times: {n}"}));
			_item.grep = "{n}";
			_item = add("item",localize({"de":"mindestens n-mal maximal m-mal: {n,m}","en":"at least n times more than m times: {n,m}"}));
			_item.grep = "{n,m}";
			_item = add("item",localize({"de":"n-mal oder öfter: {n,}","en":"n or more times: {n,}"}));
			_item.grep = "{n,}";
			_item = add("item",localize({"de":"n-mal oder öfter (kürzeste Entsprechung): {n,m}?","en":"n or more times (Shortest Match): {n,m}?"}));
			_item.grep = "{n,m}?";
		 }

		 // Entsprechung
		 var _equivalents = add ("node",localize({"de":"Entsprechung","en":"Matches"}));
		 with (_equivalents) {
			_item = add("item",localize({"de":"Markierter Unterausdruck: ()","en":"Marking Subexpression: ()"}));
			_item.grep = "()";
			_item = add("item",localize({"de":"Nicht markierter Unterausdruck (Fundstelle nicht markieren): (?:)","en":"Non-marking Subexpression (Do not mark match): (?:)"}));
			_item.grep = "(?:)";
			_item = add("item",localize({"de":"Zeichensatz: []","en":"Class of characters: []"}));
			_item.grep = "[]";
			_item = add("item",localize({"de":"Oder: |","en":"Or: |"}));
			_item.grep = "|";
			_item = add("item",localize({"de":"Positives Lookbehind: (?<=)","en":"Positive Lookbehind: (?<=)"}));
			_item.grep = "(?<=)";
			_item = add("item",localize({"de":"Positives Lookbehind (flexibel): \\K","en":"Positive Lookbehind (flexible): \\K"}));
			_item.grep = "\\K";
			_item = add("item",localize({"de":"Negatives Lookbehind: (?<!)","en":"Negative Lookbehind: (?<!)"}));
			_item.grep = "(?<!)";
			_item = add("item",localize({"de":"Positives Lookahead: (?=)","en":"Positive Lookahead: (?=)"}));
			_item.grep = "(?=)";
			_item = add("item",localize({"de":"Negatives Lookahead: (?!)","en":"Negative Lookahead: (?!)"}));
			_item.grep = "(?!)";
			_item = add("item",localize({"de":"If-Then-Else: (?(?=regex)then|else)","en":"If-Then-Else: (?(?=regex)then|else)"}));
			_item.grep = "(?(?=regex)then|else)";	
		 }

		 // Modifizierer
		 var _modifier = add ("node",localize({"de":"Modifizierer","en":"Modifiers"}));
		 with (_modifier) {
			_item = add("item",localize({"de":"Nicht zwischen Groß- und Kleinschreibung unterscheiden: (?i)","en":"Case-insensitive Off: (?i)"}));
			_item.grep = "(?i)";
			_item = add("item",localize({"de":"Zwischen Groß- und Kleinschreibung unterscheiden: (?-i)","en":"Case-insensitive On: (?-i)"}));
			_item.grep = "(?-i)";
			_item = add("item",localize({"de":"Mehrere Zeilen ein: (?m)","en":"Multiline On: (?m)"}));
			_item.grep = "(?m)";
			_item = add("item",localize({"de":"Mehrere Zeilen aus: (?-m)","en":"Multiline Off: (?-m)"}));
			_item.grep = "(?-m)";
			_item = add("item",localize({"de":"Gesamten Textabschnitt durchsuchen: (?s)","en":"Single Line Mode On: (?s)"}));
			_item.grep = "(?s)";
			_item = add("item",localize({"de":"Innerhalb eines Absatzes suchen: (?-s)","en":"Single Line Mode Off: (?-s)"}));
			_item.grep = "(?-s)";
			_item = add("item",localize({"de":"Leerzeichen im Ausdruck ignorieren: (?x)","en":"Ignore spaces in the expression: (?x)"}));
			_item.grep = "(?x)";
			_item = add("item",localize({"de":"Leerzeichen im Ausdruck nicht ignorieren: (?-x)","en":"Do not ignore spaces in the expression: (?-x)"}));
			_item.grep = "(?-x)";
			_item = add("item",localize({"de":"Kommentar: (?#comment?)","en":"Comment: (?#comment?)"}));
			_item.grep = "(?#comment?)";
			_item = add("item",localize({"de":"Quotierung : \\Q\\E","en":"Quotation: \\Q\\E"}));
			_item.grep = "\\Q\\E";
		 }

		 // Posix-Ausdrücke
		 var _posix = add ("node",localize({"de":"Posix-Ausdrücke","en":"POSIX"}));
		 with (_posix) {
			_item = add("item",localize({"de":"Buchstaben und Zahlen: [[:alnum:]]","en":"Any alphanumeric character: [[:alnum:]]"}));
			_item.grep = "[[:alnum:]]";
			_item = add("item",localize({"de":"Groß- und Kleinbuchstaben: [[:alpha:]]","en":"Any alphabetic character: [[:alpha:]]"}));
			_item.grep = "[[:alpha:]]";
			_item = add("item",localize({"de":"Leerzeichen und Tabulator: [[:blank:]]","en":"Any blank character (either space or tab): [[:blank:]]"}));
			_item.grep = "[[:blank:]]";
			_item = add("item",localize({"de":"Zahlen: [[:digit:]]","en":"Numbers: [[:digit:]]"}));
			_item.grep = "[[:digit:]]";
			_item = add("item",localize({"de":"Kleinbuchstaben: [[:lower:]]","en":"Lower-case character: [[:lower:]]"}));
			_item.grep = "[[:lower:]]";
			_item = add("item",localize({"de":"Großbuchstaben: [[:upper:]]","en":"Upper-case character: [[:upper:]]"}));
			_item.grep = "[[:upper:]]";
			_item = add("item",localize({"de":"Satzzeichen: [[:punct:]]","en":"Any punctuation character: [[:punct:]]"}));
			_item.grep = "[[:punct:]]";
			_item = add("item",localize({"de":"Sichtbare Zeichen: [[:graph:]]","en":"Any graphical character: [[:graph:]]"}));
			_item.grep = "[[:graph:]]";
			_item = add("item",localize({"de":"Weißraumzeichen: [[:space:]]","en":"Whitespace: [[:space:]]"}));
			_item.grep = "[[:space:]]";
			_item = add("item",localize({"de":"Wortzeichen: [[:word:]]","en":"Word Character: [[:word:]]"}));
			_item.grep = "[[:word:]]";
			_item = add("item",localize({"de":"Hexadezimale Ziffer: [[:xdigit:]]","en":"Any hexadecimal digit character: [[:xdigit:]]"}));
			_item.grep = "[[:xdigit:]]";
			_item = add("item",localize({"de":"Buchstabenäquivalent (alle Formen eines Buchstabens): [[=a=]]","en":"Any character of a certain glyph set: [[=a=]]"}));
			_item.grep = "[[=a=]]";
		 }

		 // Unicode-Properties
		 var _unicodeProps = add ("node",localize({"de":"Unicode-Properties","en":"Unicode Properties"}));
		 with (_unicodeProps) { 
			_item = add("item",localize({"de":"letter (Alle Buchstaben): \\p{L*}","en":"letter: \\p{L*}"}));
			_item.grep = "\\p{L*}";
			_item = add("item",localize({"de":"lowercase_letter (alle Kleinbuchstaben): \\p{Ll}","en":"lowercase_letter: \\p{Ll}"}));
			_item.grep = "\\p{Ll}";
			_item = add("item",localize({"de":"uppercase_letter (alle Großbuchstaben): \\p{Lu}","en":"uppercase_letter: \\p{Lu}"}));
			_item.grep = "\\p{Lu}";
			_item = add("item",localize({"de":"titlecase_letter (Anfangsbuchstaben): \\p{Lt}","en":"titlecase_letter: \\p{Lt}"}));
			_item.grep = "\\p{Lt}";
			_item = add("item",localize({"de":"modifier_letter (Diakritische Zeichen): \\p{Lm}","en":"modifier_letter: \\p{Lm}"}));
			_item.grep = "\\p{Lm}";
			_item = add("item",localize({"de":"letter_other (restlichen Buchstaben): \\p{Lo}","en":"letter_other: \\p{Lo}"}));
			_item.grep = "\\p{Lo}";
			_item = add("item",localize({"de":"separator (Leerräume und Umbruchzeichen ohne Tabulator): \\p{Z*}","en":"separator: \\p{Z*}"}));
			_item.grep = "\\p{Z*}";
			_item = add("item",localize({"de":"space_separator (Leerräume ohne Umbruchzeichen ohne Tabulator): \\p{Zs}","en":"space_separator: \\p{Zs}"}));
			_item.grep = "\\p{Zs}";
			_item = add("item",localize({"de":"line_separator (XML-Export): \\p{Zl}","en":"line_separator (XML-Export): \\p{Zl}"}));
			_item.grep = "\\p{Zl}";
			_item = add("item",localize({"de":"paragraph-separator (XML-Export): \\p{Zp}","en":"paragraph-separator (XML-Export): \\p{Zp}"}));
			_item.grep = "\\p{Zp}";
			_item = add("item",localize({"de":"symbol: \\p{S*}","en":"symbol: \\p{S*}"}));
			_item.grep = "\\p{S*}";
			_item = add("item",localize({"de":"math_symbol: \\p{Sm}","en":"math_symbol: \\p{Sm}"}));
			_item.grep = "\\p{Sm}";
			_item = add("item",localize({"de":"currency_symbol (Währungssymbole): \\p{Sc}","en":"currency_symbol: \\p{Sc}"}));
			_item.grep = "\\p{Sc}";
			_item = add("item",localize({"de":"modifier_symbol (Bedeutungsverändernde Symbole wie Akzente): \\p{Sk}","en":"modifier_symbol: \\p{Sk}"}));
			_item.grep = "\\p{Sk}";
			_item = add("item",localize({"de":"other_symbol: \\p{So}","en":"other_symbol: \\p{So}"}));
			_item.grep = "\\p{So}";
			_item = add("item",localize({"de":"number (alle Ziffern): \\p{N*}","en":"number: \\p{N*}"}));
			_item.grep = "\\p{N*}";
			_item = add("item",localize({"de":"decimal_digit_number (Ziffern von 0-9): \\p{Nd}","en":"decimal_digit_number: \\p{Nd}"}));
			_item.grep = "\\p{Nd}";
			_item = add("item",localize({"de":"letter_number (Römische Ziffern mit den Codepoints 2150-218F): \\p{Nl}","en":"letter_number: \\p{Nl}"}));
			_item.grep = "\\p{Nl}";
			_item = add("item",localize({"de":"other_numbers (hoch- und tiefgestellte Ziffern und Brüche): \\p{No}","en":"other_numbers: \\p{No}"}));
			_item.grep = "\\p{No}";
			_item = add("item",localize({"de":"punctation (Satzzeichen Striche Anführungszeichen): \\p{P*}","en":"punctation: \\p{P*}"}));
			_item.grep = "\\p{P*}";
			_item = add("item",localize({"de":"dash_punctuation (ohne Trennstriche): \\p{Pd}","en":"dash_punctuation: \\p{Pd}"}));
			_item.grep = "\\p{Pd}";
			_item = add("item",localize({"de":"open_puntuation: \\p{Ps}","en":"open_puntuation: \\p{Ps}"}));
			_item.grep = "\\p{Ps}";
			_item = add("item",localize({"de":"close_punctuation: \\p{Pe}","en":"close_punctuation: \\p{Pe}"}));
			_item.grep = "\\p{Pe}";
			_item = add("item",localize({"de":"initial_punctuation (öffnende Anführungszeichen aber keine Zollzeichen): \\p{Pi}","en":"initial_punctuation: \\p{Pi}"}));
			_item.grep = "\\p{Pi}";
			_item = add("item",localize({"de":"final_punctuation (schließende Anführungszeichen aber keine Zollzeichen): \\p{Pf}","en":"final_punctuation: \\p{Pf}"}));
			_item.grep = "\\p{Pf}";
			_item = add("item",localize({"de":"other_punctuation: \\p{Po}","en":"other_punctuation: \\p{Po}"}));
			_item.grep = "\\p{Po}";
		 }   
	  } /* END tree _wildcardsForFindTree */
	
	  var _buttonGroup = add ("group");
	  with (_buttonGroup) {
		 var _close = add ("button", undefined, localize({"de":"Schließen","en":"Close"}), {name: "cancel"});
		 var _insert = add ("button", undefined, localize({"de":"Einfügen","en":"Insert"}), {name: "ok"});     
	  }
	} /* END dialog _selectWildcardsForFind */
	
	var _insertWildcardForFind = _selectWildcardsForFind.show ();

	if (_insertWildcardForFind == 1 && _wildcardsForFindTree.selection != null) {
		return _wildcardsForFindTree.selection["grep"] || ""; 
	} else {
		return "";
	}
} /* END function __getWildcardsForFind */



function __getWildcardsForChange() {
  
	var _item;
	
	// Wildcards Dialog for Change
	var _selectWildcardsForChange = new Window ("dialog",localize({"de":"Sonderzeichen für Ersetzung","en":"Wildcards for Change"}));
	with (_selectWildcardsForChange) {
	  alignChildren = "right";
	  var _wildcardsForChangeTree = add ("treeview");
	  with (_wildcardsForChangeTree) {
		 preferredSize = [350,260];
		 itemSize = [560,20];

		_item = add("item",localize({"de":"Tabulator: \\t","en":"Tab Character: \\t"}));
		_item.grep = "\\t"; 
		_item = add("item",localize({"de":"Harter Zeilenumbruch: \\n","en":"Forced Line Break: \\n"}));
		_item.grep = "\\n";
		_item = add("item",localize({"de":"Absatzende: \\r","en":"End of Paragraph: \\r"}));
		_item.grep = "\\r";

		 // Symbole
		 var _symbols = add ("node",localize({"de":"Symbole","en":"Symbols"}));
		 with (_symbols) {
			_item = add("item",localize({"de":"Aufzählungszeichen: ~8","en":"Bullet Character: ~8"}));
			_item.grep = "~8";
			_item = add("item",localize({"de":"Caret-Zeichen: \\^","en":"Caret Character: \\^"}));
			_item.grep = "\\^";
			_item = add("item",localize({"de":"Copyright-Symbol: ~2","en":"Copyright Symbol: ~2"}));
			_item.grep = "~2";
			_item = add("item",localize({"de":"Auslassungszeichen (Ellipse): ~e","en":"Ellipsis: ~e"}));
			_item.grep = "~e";
			_item = add("item",localize({"de":"Absatzmarke: ~7","en":"Paragraph Symbol: ~7"}));
			_item.grep = "~7";
			_item = add("item",localize({"de":"Eingetragene Marke: ~r","en":"Registered Trademark Symbol: ~r"}));
			_item.grep = "~r";
			_item = add("item",localize({"de":"Paragraphenzeichen: ~6","en":"Section Symbol: ~6"}));
			_item.grep = "~6";
			_item = add("item",localize({"de":"Trademark-Symbol: ~d","en":"Trademark Symbol: ~d"}));
			_item.grep = "~d";
		 } 

		 // Marken
		 var _marks = add ("node",localize({"de":"Marken","en":"Marks"}));
		 with (_marks) {
			_item = add("item",localize({"de":"Aktuelle Seitenzahl: ~N","en":"Current Page Number: ~N"}));
			_item.grep = "~N";
			_item = add("item",localize({"de":"Nächste Seitenzahl: ~X","en":"Next Page Number: ~X"}));
			_item.grep = "~X";
			_item = add("item",localize({"de":"Vorherige Seitenzahl: ~V","en":"Previous Page Number: ~V"}));
			_item.grep = "~V";
			_item = add("item",localize({"de":"Abschnittsmarke: ~x","en":"Section Marker: ~x"}));
			_item.grep = "~x";
		 }

		 // Trenn- und Gedankenstriche
		 var _dashes = add ("node",localize({"de":"Trenn- und Gedankenstriche","en":"Hyphens and Dashes"}));
		 with (_dashes) {
			_item = add("item",localize({"de":"Geviertstrich: ~_","en":"Em Dash: ~_"}));
			_item.grep = "~_";
			_item = add("item",localize({"de":"Halbgeviertstrich: ~=","en":"En Dash: ~="}));
			_item.grep = "~=";
			_item = add("item",localize({"de":"Bindestrich: \\-","en":"Hyphen: \\-"}));
			_item.grep = "\\-";
			_item = add("item",localize({"de":"Bedingter Trennstrich: ~-","en":"Discretionary Hyphen: ~-"}));
			_item.grep = "~-";
			_item = add("item",localize({"de":"Geschützter Trennstrich: ~~","en":"Nonbreaking Hyphen: ~~"}));
			_item.grep = "~~";
		 }

		 // Leerraum
		 var _spaces = add ("node",localize({"de":"Leerraum","en":"Spaces"}));
		 with (_spaces) {
			_item = add("item",localize({"de":"Geviert: ~m","en":"Em Space: ~m"}));
			_item.grep = "~m";
			_item = add("item",localize({"de":"Halbgeviert: ~>","en":"En Space: ~>"}));
			_item.grep = "~>";
			_item = add("item",localize({"de":"Drittelgeviert: ~3","en":"Third Space: ~3"}));
			_item.grep = "~3";
			_item = add("item",localize({"de":"Viertelgeviert: ~4","en":"Quarter Space: ~4"}));
			_item.grep = "~4";
			_item = add("item",localize({"de":"Sechstelgeviert: ~%","en":"Sixth Space: ~%"}));
			_item.grep = "~%";
			_item = add("item",localize({"de":"Achtelgeviert: ~<","en":"Thin Space: ~<"}));
			_item.grep = "~<";
			_item = add("item",localize({"de":"Ausgleichsleerzeichen: ~f","en":"Flush Space: ~f"}));
			_item.grep = "~f";
			_item = add("item",localize({"de":"1/24-Geviert: ~|","en":"Hair Space: ~|"}));
			_item.grep = "~|";
			_item = add("item",localize({"de":"Geschützes Leerzeichen: ~S","en":"Nonbreaking Space: ~S"}));
			_item.grep = "~S";
			_item = add("item",localize({"de":"Geschütztes Leerzeichen (feste Breite): ~s","en":"Nonbreaking Space (fixed width): ~s"}));
			_item.grep = "~s";
			_item = add("item",localize({"de":"Interpunktionsleerzeichen: ~.","en":"Punctuation Space: ~."}));
			_item.grep = "~.";
			_item = add("item",localize({"de":"Ziffernleerzeichen: ~/","en":"Figure Space: ~/"}));
			_item.grep = "~/";
		 }

		 // Anführungszeichen
		 var _puntuation = add ("node",localize({"de":"Anführungszeichen","en":"Quotation Marks"}));
		 with (_puntuation) {
			_item = add("item",localize({"de":"Gerades doppeltes Anführungszeichen: ~\"","en":"Double Quotation Mark: ~\""}));
			_item.grep = "~\"";
			_item = add("item",localize({"de":"Öffnendes doppeltes Anführungszeichen: ~{","en":"Double Left Quotation Mark: ~{"}));
			_item.grep = "~{";
			_item = add("item",localize({"de":"Schließendes doppeltes Anführungszeichen: ~}","en":"Double Right Quotation Mark: ~}"}));
			_item.grep = "~}";
			_item = add("item",localize({"de":"Gerades einfaches Anführungszeichen (Apostroph): ~\'","en":"Straight Single Quotation Mark (Apostrophe): ~\'"}));
			_item.grep = "~\'";
			_item = add("item",localize({"de":"Öffnendes einfaches Anführungszeichen: ~[","en":"Single Left Quotation Mark: ~["}));
			_item.grep = "~[";
			_item = add("item",localize({"de":"Schließendes einfaches Anführungszeichen: ~]","en":"Single Right Quotation Mark: ~]"}));
			_item.grep = "~]";
		 }

		 // Umbruchzeichen
		 var _breaks = add ("node",localize({"de":"Umbruchzeichen","en":"Break Characters"}));
		 with (_breaks) {
			_item = add("item",localize({"de":"Standardzeilenumbruch: ~b","en":"Standard carriage return: ~b"}));
			_item.grep = "~b";
			_item = add("item",localize({"de":"Spaltenumbruch: ~M","en":"Column Break: ~M"}));
			_item.grep = "~M";
			_item = add("item",localize({"de":"Rahmenumbruch: ~R","en":"Frame Break: ~R"}));
			_item.grep = "~R";
			_item = add("item",localize({"de":"Seitenumbruch: ~P","en":"Page Break: ~P"}));
			_item.grep = "~P";
			_item = add("item",localize({"de":"Umbruch für ungerade Seiten: ~L","en":"Odd Page Break: ~L"}));
			_item.grep = "~L";
			_item = add("item",localize({"de":"Umbruch für gerade Seiten: ~E","en":"Even Page Break: ~E"}));
			_item.grep = "~E";
			_item = add("item",localize({"de":"Bedingter Zeilenumbruch: ~k","en":"Discretionary Line Break: ~k"}));
			_item.grep = "~k";
		 }

		 // Andere
		 var _others = add ("node",localize({"de":"Andere","en":"Other"}));
		 with (_others) { 
			_item = add("item",localize({"de":"Tabulator für rechte Ausrichtung: ~y","en":"Right Indent Tab: ~y"}));
			_item.grep = "~y";
			_item = add("item",localize({"de":"Einzug bis hierhin: ~i","en":"Indent to Here: ~i"}));
			_item.grep = "~i";
			_item = add("item",localize({"de":"Verschachteltes Format beenden: ~h","en":"End Nested Style Here: ~h"}));
			_item.grep = "~h";
			_item = add("item",localize({"de":"Verbindung unterdrücken: ~j","en":"Nonjoiner: ~j"}));
			_item.grep = "~j";
			_item = add("item",localize({"de":"Inhalt der Zwischenablage (formatiert): ~c","en":"Clipboard Contents (Formatted): ~c"}));
			_item.grep = "~c";
			_item = add("item",localize({"de":"Inhalt der Zwischenablage (unformatiert): ~C","en":"Clipboard Contents (Unformatted): ~C"}));
			_item.grep = "~C";
		 }

		 // Gefunden
		 var _searchResults = add ("node",localize({"de":"Gefunden","en":"Found"}));
		 with (_searchResults) {
			_item = add("item",localize({"de":"Text gefunden: $0","en":"Found Text: $0"}));
			_item.grep = "$0";
			_item = add("item",localize({"de":"Gefundene Stelle 1: $1","en":"Found Text 1: $1"}));
			_item.grep = "$1";
			_item = add("item",localize({"de":"Gefundene Stelle 2: $2","en":"Found Text 2: $2"}));
			_item.grep = "$2";
			_item = add("item",localize({"de":"Gefundene Stelle 3: $3","en":"Found Text 3: $3"}));
			_item.grep = "$3";
			_item = add("item",localize({"de":"Gefundene Stelle 4: $4","en":"Found Text 4: $4"}));
			_item.grep = "$4";
			_item = add("item",localize({"de":"Gefundene Stelle 5: $5","en":"Found Text 5: $5"}));
			_item.grep = "$5";
			_item = add("item",localize({"de":"Gefundene Stelle 6: $6","en":"Found Text 6: $6"}));
			_item.grep = "$6";
			_item = add("item",localize({"de":"Gefundene Stelle 7: $7","en":"Found Text 7: $7"}));
			_item.grep = "$7";
			_item = add("item",localize({"de":"Gefundene Stelle 8: $8","en":"Found Text 8: $8"}));
			_item.grep = "$8";
			_item = add("item",localize({"de":"Gefundene Stelle 9: $9","en":"Found Text 9: $9"}));
			_item.grep = "$9";
		 }            
	  } /* END tree _wildcardsForChangeTree */
	
	  var _buttonGroup = add ("group");
	  with (_buttonGroup) {
		 var _close = add ("button", undefined, localize({"de":"Schließen","en":"Close"}), {name: "cancel"});
		 var _insert = add ("button", undefined, localize({"de":"Einfügen","en":"Insert"}), {name: "ok"});     
	  }
	} /* END dialog _selectWildcardsForChange */
	
	var _insertWildcardForChange = _selectWildcardsForChange.show ();

	if (_insertWildcardForChange == 1 && _wildcardsForChangeTree.selection != null) {
		return _wildcardsForChangeTree.selection["grep"] || ""; 
	} else {
		return "";
	}
 } /* END function __getWildcardsForChange */


function findChangeGrep (_findOrChange, _grep, _change, _findCharacterStyle, _changeCharacterStyle, _findParagraphStyle, _changeParagraphStyle, _place, _searchOption) {
  
  var _doc = app.activeDocument;
  var _hits = 0;
  var _highlightColor = _global["highlightColor"];
  var _highlightMethod = _global["highlightMethod"];

  var _highlightCondition = _doc.conditions.itemByName("::Highlight_GREP::");
  if (_highlightCondition.isValid) {
    _highlightColor = _highlightCondition.indicatorColor;
    _highlightMethod = _highlightCondition.indicatorMethod;
  }  
  
  delConditions ();

  _highlightCondition = _doc.conditions.itemByName("::Highlight_GREP::");
  if (!_highlightCondition.isValid) {
	_highlightCondition = _doc.conditions.add ({ 
		name: "::Highlight_GREP::", 
		indicatorColor: _highlightColor, 
		indicatorMethod: _highlightMethod
	});
  }
  
  var _findChangeResults = findChange (
	  _findOrChange, 
	  _grep, 
	  _change, 
	  _findCharacterStyle, 
	  _changeCharacterStyle, 
	  _findParagraphStyle, 
	  _changeParagraphStyle, 
	  _place, 
	  [_highlightCondition], 
	  _searchOption
	);

  if ((_findChangeResults.length > 0) && (_findChangeResults[0].constructor.name == "Array")) { 
    var _hitcounter = 0;
    for (var i=0; i<_findChangeResults.length; i++) {
      for (var j=0; j<_findChangeResults[i].length; j++) {
        _hitcounter += 1;
      }   
    }    
    _hits = _hitcounter;   
  } else { 
    _hits = _findChangeResults.length;
  }  
  return _hits; 
}


function delConditions () {
  
	var _highlightCondition = app.activeDocument.conditions.itemByName("::Highlight_GREP::");
	if (_highlightCondition.isValid) {
		_highlightCondition.remove ();
	}
}


function delConditionsInAllDocs () {
  
	for (var d = 0; d < app.documents.length; d++) {
		var _highlightCondition = app.documents[d].conditions.itemByName("::Highlight_GREP::");
		if (_highlightCondition.isValid) {
			_highlightCondition.remove ();
		}
	}
}


function findChange (_findOrChange, _find, _change, _findCharacterStyle, _changeCharacterStyle, _findParagraphStyle, _changeParagraphStyle, _place, _highlightCondition, _searchOption) {
  
  with (app) {   
    with (findChangeGrepOptions) {   
      //User-Einstellungen speichern
      var _userIncludeFootnotes = includeFootnotes;
      var _userIncludeHiddenLayers = includeHiddenLayers;
      var _userIncludeLockedLayersForFind = includeLockedLayersForFind;
      var _userIncludeLockedStoriesForFind = includeLockedStoriesForFind;
      var _userIncludeMasterPages = includeMasterPages;
      //Einstellungen setzen
      includeFootnotes = _searchOption[2];
      includeHiddenLayers = _searchOption[0];
      includeLockedLayersForFind = false; 
      includeLockedStoriesForFind = false; 
      includeMasterPages = _searchOption[1];     
    }  
  
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;
    
    with (findGrepPreferences) {
      findWhat = _find;
      appliedCharacterStyle = _findCharacterStyle;
      appliedParagraphStyle = _findParagraphStyle;
    }
    
    with (changeGrepPreferences) {
      changeTo = _change;  
      appliedCharacterStyle = _changeCharacterStyle;
      appliedParagraphStyle = _changeParagraphStyle;      
      changeConditionsMode = ChangeConditionsModes.ADD_TO; 
      if (_findOrChange == "change" && _change == "") {
        appliedConditions = NothingEnum.nothing;
      } else {
        appliedConditions = _highlightCondition; 
      }    
    }
     
    try {
      var _results = _place.changeGrep(true);  
    } catch(e) { 
      /*alert("Place, changeGrep: " + e + "Zeile: " + e.line);*/ 
    }    
    
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;
    
    with (findChangeGrepOptions) {     
      //User-Einstellungen wieder herstellen
      includeFootnotes = _userIncludeFootnotes;
      includeHiddenLayers = _userIncludeHiddenLayers;
      includeLockedLayersForFind = _userIncludeLockedLayersForFind;
      includeLockedStoriesForFind = _userIncludeLockedStoriesForFind;
      includeMasterPages = _userIncludeMasterPages;    
    } 
  }
  return _results;
}

function findHits () {
  
  var _place = app.activeDocument;
  var _highlightCondition;
  var _results = [];

  if (app.activeDocument.conditions.itemByName("::Highlight_GREP::").isValid) {
    _highlightCondition = [app.activeDocument.conditions.itemByName("::Highlight_GREP::")];
  } else {
    _highlightCondition = NothingEnum.nothing;
  } 

  with (app) {   
    with (findChangeGrepOptions) {   
      //User-Einstellungen speichern
      var _userIncludeFootnotes = includeFootnotes;
      var _userIncludeHiddenLayers = includeHiddenLayers;
      var _userIncludeLockedLayersForFind = includeLockedLayersForFind;
      var _userIncludeLockedStoriesForFind = includeLockedStoriesForFind;
      var _userIncludeMasterPages = includeMasterPages;
      //Einstellungen setzen
      includeFootnotes = true;
      includeHiddenLayers = true;
      includeLockedLayersForFind = true;
      includeLockedStoriesForFind = true;
      includeMasterPages = true;     
    }  
  
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;  
    
    with (findGrepPreferences) {
      appliedConditions = _highlightCondition;
    }
     
    try {
      _results = _place.findGrep();  
    } catch(e) { 
      /*alert("Place, findGrep: " + e + "Zeile: " + e.line);*/ 
    }    
    
    findGrepPreferences = NothingEnum.nothing;
    changeGrepPreferences = NothingEnum.nothing;
    
    with (findChangeGrepOptions) {     
      //User-Einstellungen wieder herstellen
      includeFootnotes = _userIncludeFootnotes;
      includeHiddenLayers = _userIncludeHiddenLayers;
      includeLockedLayersForFind = _userIncludeLockedLayersForFind;
      includeLockedStoriesForFind = _userIncludeLockedStoriesForFind;
      includeMasterPages = _userIncludeMasterPages;    
    } 
  }
  return _results;
}


// function filePath by Peter Kahrel -- www.kahrel.plus.com 
function filePath () {
	try {
		return File (app.activeScript).path;
	} catch(e) {
		return File (e.fileName).path;
	}
}

  
// function showIt von Gregor Fellenz: www.indd-skript.de
// showIt() zeigt das übergebene Objekt an
function showIt (_object) {
	if (_object != null && app.documents.length > 0 && app.layoutWindows.length > 0 ) {
		app.activeWindow.activeSpread = getSpreadByObject (_object);
		app.select(_object);
		var myZoom = app.activeWindow.zoomPercentage; 
		app.activeWindow.zoom(ZoomOptions.showPasteboard); 
		app.activeWindow.zoomPercentage = myZoom;
		return true;
	} else {
		return false;
	}
}


// function getSpreadByObject von Gregor Fellenz: www.indd-skript.de
// Liefert den Druckbogen, auf dem sich das Objekt befindet
function  getSpreadByObject (_object) {
	if (_object != null) {
		_object = _object.getElements ()[0]; // Problems with Baseclass Objects like PageItem in  CS5!
		if (_object.hasOwnProperty("baseline")) {
			_object = _object.parentTextFrames[0];
		}
		while (_object != null) {
			var whatIsIt = _object.constructor;
			switch (whatIsIt) {
				case Spread : 
					return _object;
				case Character : 
					_object = _object.parentTextFrames[0]; 
					break;
				case Footnote : // drop through
				case Cell : 
					_object = _object.insertionPoints[0].parentTextFrames[0]; 
					break;
				case Note : 
					_object = _object.storyOffset.parentTextFrames[0]; 
					break;
				case XMLElement : 
					if (_object.insertionPoints[0] != null) { 
						_object = _object.insertionPoints[0].parentTextFrames[0]; 
						break; 
					}
				case Application : 
					return null;
				default: 
					_object = _object.parent;
			}
			if (_object == null) return null;
		}
		return _object;
	} else {
		return null;
	}
}


// Neue Methode "itemByLabel" fuer CharacterStyles und ParagraphStyles
function prototypeItemByLabel () {

  Object.prototype.itemByLabel=function(_label) { 
      
    var _styles = [];
    var _result = null;
    
    switch (this.constructor.name) {
      case "CharacterStyles" :
        _styles = app.activeDocument.allCharacterStyles;
        break;
      case "ParagraphStyles" :
        _styles = app.activeDocument.allParagraphStyles;
        break;
      default :
        _result = null;
    }
      
    for (var i=0; i<_styles.length; i++) {    
      if (_styles[i].label == _label) {
        _result = _styles[i];
      }     
    }     
    return _result; 
  };
}


// Warnmeldung falls im Dokument bereits Bedingungen fuer bedingten Text vorhanden sind.
function alertConditionalText () {  

	if (_global["alertCounter"] == true && _global["lastDoc"] == app.activeDocument) { 
		return true; 
	}
	if (app.activeDocument.conditions.length == 0) { 
		return true;
	}
	if (
		app.activeDocument.conditions.length == 1 && 
		app.activeDocument.conditions.itemByName("::Highlight_GREP::").isValid
	) { 
		return true; 
	} 
	
	var _continue = confirm (localize(_global.alertConditionalTextMessage));
	
	_global["alertCounter"] = true;
	_global["lastDoc"] = app.activeDocument.getElements()[0];
	
	return _continue;
} /* END function alertConditionalText */





/* Deutsch-Englische Dialogtexte definieren */
function __defPurifierLocalizeStrings() {
	
	_global.noDocOpenAlert = { 
		en:"At least one document must be open to execute the script!",
		de:"F\u00FCr die Ausf\u00FChrung des Skriptes ist ein ge\u00F6ffnetes Dokument erforderlich!" 
	};
	
	_global.goBackLabel = { 
		en:"Purify document",
		de:"Dokument aufbereiten" 
	};
	
	_global.processingErrorAlert = { 
		en:"Error processing the document!",
		de:"Fehler bei der Verarbeitung des Dokuments!" 
	};

	_global.errorMessageLabel = { 
		en:"Error mssage:",
		de:"Fehlermeldung:" 
	};

	_global.lineLabel = { 
		en:"Line:",
		de:"Zeile:" 
	};
	
	_global.numberOfHitsHelpTip = { 
		en:"Number of hits",
		de:"Anzahl der Fundstellen" 
	};
	
	_global.selectionButtonHelpTip = { 
		en:"Select match(es)",
		de:"Auswahl der Fundstelle(n)" 
	};
	
	_global.selectionButtonLabel = { 
		en:"S",
		de:"A" 
	};
	
	_global.copyButtonHelpTip = { 
		en:"Copy match(es) to clipboard",
		de:"Fundstelle(n) in die Zwischenablage kopieren" 
	};

	_global.copyButtonLabel = { 
		en:"C",
		de:"K" 
	};

	_global.clearConditionButtonHelpTip = { 
		en:"Remove Highlighting",
		de:"Highlight entfernen" 
	};

	_global.clearConditionButtonLabel = { 
		en:"\u00D7",
		de:"\u00D7" 
	};

	_global.liveCheckboxLabel = { 
		en:"Live Modus",
		de:"Live Modus" 
	};

	_global.findWhatStatictextLabel = { 
		en:"Find what:",
		de:"Suchen nach:" 
	};

	_global.wildcardsFindHelpTip = { 
		en:"Special characters for searching",
		de:"Sonderzeichen für Suche" 
	};

	_global.refreshFindStyles = { 
		en:"Refresh character and paragraph styles",
		de:"Zeichen- und Absatzformate aktualisieren" 
	};

	_global.hiddenLayersHelpTip = { 
		en:"Include hidden layers and objects",
		de:"Ausgeblendete Ebenen und Objekte einschließen" 
	};

	_global.masterPagesHelpTip = { 
		en:"Include Master Pages",
		de:"Musterseiten einbeziehen" 
	};

	_global.footnotesHelpTip = { 
		en:"Include footnotes",
		de:"Fußnoten einbeziehen" 
	};

	_global.placesStatictextLabel = { 
		en:"Search:",
		de:"Durchsuchen:" 
	};

	_global.documentLabel = { 
		en:"Document",
		de:"Gesamtes Dokument" 
	};
	
	_global.storyLabel = { 
		en:"Story",
		de:"Textabschnitt" 
	};
	 
	_global.textframeLabel = { 
		en:"Textframe",
		de:"Textrahmen" 
	};
	 
	_global.tablesLabel = { 
		en:"Tabels",
		de:"Tabellen" 
	};
	 
	_global.selectionLabel = { 
		en:"Selection",
		de:"Auswahl" 
	};

	_global.findButtonLabel = { 
		en:"Find",
		de:"Suchen" 
	};

	_global.exitButtonLabel = { 
		en:"Done",
		de:"Fertig" 
	};

	_global.changeGrepStatictextLabel = { 
		en:"Change to:",
		de:"Ändern in:" 
	};
	
	_global.wildcardsChangeHelpTip = { 
		en:"Special characters for replacement",
		de:"Sonderzeichen für Ersetzung" 
	};
	
	_global._refreshChangeStylesHelpTip = { 
		en:"Refresh character and paragraph styles",
		de:"Zeichen- und Absatzformate aktualisieren" 
	};

	_global.changeButtonLabel = { 
		en:"Change",
		de:"Ändern" 
	};

	_global.changeButtonHelpTip = { 
		en:"Change all matches!",
		de:"Ändert alle Fundstellen!" 
	};

	_global.copyMatchesUndoLabel = { 
		en:"Copy matches",
		de:"Fundstellen kopieren" 
	};

	_global.copyMatchesAlertMessage = { 
		en:"The following matches were copied to the clipboard:",
		de:"Folgende Fundstelle(n) wurden in die Zwischenablage kopiert:" 
	};

	_global.failedCopyAlertMessage = { 
		en:"Match(es) could not be copied to the clipboard!\rPossible causes:\r- No match(es) in the document\r- The search was not performed as yet.",
		de:"Die Fundstelle(n) konnte(n) nicht in die Zwischenablage kopiert werden!\rMögliche Ursachen:\r- Keine Fundstellen im Dokument vorhanden\r- Suche wurde noch nicht ausgeführt" 
	};

	_global.matchInOversetAlertMessage = { 
		en:"Match in overset text or on master pages!",
		de:"Treffer im Übersatztext oder auf einer Musterseite!" 
	};

	_global.lastMatchAlertMessage = { 
		en:"You have reached the last match.",
		de:"Letzte Fundstelle erreicht." 
	};

	_global.noMatchAlertMessage = { 
		en:"No matches in document!",
		de:"Keine Übereinstimmungen im Dokument vorhanden!" 
	};

	_global.emptyCharacterStyleLabel = { 
		en:"Character Style: blank",
		de:"Zeichenformat: leer" 
	};

	_global.emptyParagraphStyleLabel = { 
		en:"Paragraph Style: blank",
		de:"Absatzformat: leer" 
	};

	_global.alertConditionalTextMessage = { 
		en:"Caution! You already use \"Conditional Text\" in your document.\r\rIn certain cases, these conditions can be overwritten by this script.\r\rContinue Anyway?",
		de:"Vorsicht!\rSie arbeiten in Ihrem Dokument mit \"bedingtem Text\".\r\rIn bestimmten Fällen können die \"Bedingungen\" durch die Suche dieses Skipts überschrieben werden.\r\rTrotzdem Fortfahren?" 
	};

	_global.refreshCharacterStyleLabel = {
		en:"Character style %1 is not available!\rPlease update the styles by clicking on the refresh button.",
		de:"Das Zeichenformat %1 ist nicht (mehr) vorhanden!\rBitte aktualisieren Sie die Formate durch Clicken auf den Refresh-Button."
	}

	_global.refreshParagraphStyleLabel = {
		en:"The paragraph style %1 is not available!\rPlease update the styles by clicking on the refresh button.",
		de:"Das Absatzformat %1 ist nicht (mehr) vorhanden!\rBitte aktualisieren Sie die Formate durch Clicken auf den Refresh-Button."
	}
	
} /* END function __defLocalizeStrings */