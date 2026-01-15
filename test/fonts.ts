import { HtmlElement } from "@levischuck/tiny-html";
import { extractFontsFromHTML } from "../src/fontHtml.ts";

const html : HtmlElement = {
  "type": "div",
  "props": {
    "style": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "justifyContent": "space-between",
      "height": "100vh",
      "width": "100vw",
      "fontFamily": "'Noto Sans', 'Open Sans'",
      "background": "#fff",
      "position": "relative",
      "border": "none"
    },
    "children": [
      {
        "type": "div",
        "props": {
          "style": {
            "height": "50vh",
            "width": "100%",
            "display": "flex"
          },
          "children": []
        }
      },
      {
        "type": "div",
        "props": {
          "style": {
            "justifyContent": "center",
            "textAlign": "center",
            "flexGrow": "1",
            "borderColor": "blue",
            "maxHeight": "25vh",
            "display": "flex",
            "overflow": "visible",
            "wordBreak": "break-word"
          },
          "children": {
            "type": "span",
            "props": {
              "style": {
                "fontSize": "50px"
              },
              "children": "Nuclear Reactors are cool"
            }
          }
        }
      },
      {
        "type": "div",
        "props": {
          "style": {
            "justifyContent": "center",
            "textAlign": "center",
            "flexGrow": "1",
            "display": "flex",
            "paddingLeft": "10px",
            "paddingRight": "10px"
          },
          "children": {
            "type": "span",
            "props": {
              "style": {
                "fontSize": "30px"
              },
              "children": "Test string"
            }
          }
        }
      },
      {
        "type": "div",
        "props": {
          "style": {
            "justifyContent": "space-between",
            "flexGrow": "1",
            "display": "flex",
            "gap": "10px",
            "paddingLeft": "10px",
            "paddingRight": "10px",
            "width": "100%"
          },
          "children": [
            {
              "type": "div",
              "props": {
                "style": {
                  "justifyContent": "flex-end",
                  "flexGrow": "1",
                  "display": "flex",
                  "flexDirection": "column",
                  "gap": "10px"
                },
                "children": []
              }
            },
            {
              "type": "div",
              "props": {
                "style": {
                  "justifyContent": "flex-end",
                  "flexGrow": "1",
                  "display": "flex",
                  "flexDirection": "column",
                  "gap": "10px",
                  "alignItems": "flex-end"
                },
                "children": {
                  "type": "span",
                  "props": {
                    "style": {
                      "fontSize": "35px"
                    },
                    "children": []
                  }
                }
              }
            }
          ]
        }
      },
      {
        "type": "div",
        "props": {
          "style": {
            "position": "absolute",
            "top": "20px",
            "right": "20px",
            "display": "flex"
          },
          "children": {
            "type": "span",
            "props": {
              "style": {
                "padding": "3px",
                "backgroundColor": "white"
              },
              "children": []
            }
          }
        }
      },
      {
        "type": "div",
        "props": {
          "style": {
            "position": "absolute",
            "top": "20px",
            "left": "20px",
            "display": "flex"
          },
          "children": {
            "type": "div",
            "props": {
              "style": {
                "flexGrow": "1",
                "display": "flex",
                "flexDirection": "column"
              },
              "children": {
                "type": "div",
                "props": {
                  "style": {
                    "flexGrow": "1",
                    "display": "flex"
                  },
                  "children": {
                    "type": "span",
                    "props": {
                      "style": {
                        "fontFamily": "'Atkinson Hyperlegible Mono'",
                        "fontSize": "40px"
                      },
                      "children": "333"
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
};

const fontsToLoad = await extractFontsFromHTML(html);
console.log(fontsToLoad);