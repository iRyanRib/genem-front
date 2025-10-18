import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronDown, ChevronRight, Filter, X, CheckCircle2, Circle } from "lucide-react";
import { questionTopicsApi, QuestionTopic } from "../services/questionTopicsApi";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

// Interfaces para armazenar códigos e nomes
interface FieldData {
  name: string;
  code: string;
}

interface AreaData {
  name: string;
  code: string;
}

interface GeneralTopicData {
  name: string;
  code: string;
}

interface TopicSelection {
  fieldCode?: string;
  areas: { [areaCode: string]: AreaSelection };
}

interface AreaSelection {
  selected: boolean;
  generalTopics: { [topicCode: string]: GeneralTopicSelection };
}

interface GeneralTopicSelection {
  selected: boolean;
  specificTopics: Set<string>;
}

interface TopicCascadeFilterProps {
  onTopicsChange: (topicIds: string[]) => void;
}

export default function TopicCascadeFilter({ onTopicsChange }: TopicCascadeFilterProps) {
  // Armazenar campos com seus códigos
  const [fields, setFields] = useState<FieldData[]>([]);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  
  // Estrutura de seleções por campo CODE
  const [selections, setSelections] = useState<{ [fieldCode: string]: TopicSelection }>({});
  
  // Estados de carregamento
  const [loading, setLoading] = useState(false);
  const [areasCache, setAreasCache] = useState<{ [fieldCode: string]: AreaData[] }>({});
  const [generalTopicsCache, setGeneralTopicsCache] = useState<{ [key: string]: GeneralTopicData[] }>({});
  const [specificTopicsCache, setSpecificTopicsCache] = useState<{ [key: string]: string[] }>({});
  
  // Estados de expansão
  const [expandedAreas, setExpandedAreas] = useState<{ [key: string]: boolean }>({});
  const [expandedGeneralTopics, setExpandedGeneralTopics] = useState<{ [key: string]: boolean }>({});

  // Carregar campos ao montar
  useEffect(() => {
    loadFields();
  }, []);

  // Atualizar topicIds sempre que as seleções mudarem
  useEffect(() => {
    updateTopicIds();
  }, [selections]);

  const loadFields = async () => {
    setLoading(true);
    try {
      // Buscar todos os tópicos para extrair campos únicos
      const allTopics = await questionTopicsApi.searchQuestionTopics({});
      
      // Extrair campos únicos com seus códigos
      const fieldsMap = new Map<string, FieldData>();
      allTopics.forEach(topic => {
        if (!fieldsMap.has(topic.field_code)) {
          fieldsMap.set(topic.field_code, {
            name: topic.field,
            code: topic.field_code
          });
        }
      });
      
      setFields(Array.from(fieldsMap.values()));
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async (fieldCode: string) => {
    if (areasCache[fieldCode]) return areasCache[fieldCode];
    
    try {
      // Buscar tópicos do campo específico
      const topics = await questionTopicsApi.searchQuestionTopics({ field_code: fieldCode });
      
      // Extrair áreas únicas com seus códigos
      const areasMap = new Map<string, AreaData>();
      topics.forEach(topic => {
        if (!areasMap.has(topic.area_code)) {
          areasMap.set(topic.area_code, {
            name: topic.area,
            code: topic.area_code
          });
        }
      });
      
      const areas = Array.from(areasMap.values());
      setAreasCache((prev: any) => ({ ...prev, [fieldCode]: areas }));
      return areas;
    } catch (error) {
      console.error('Error loading areas:', error);
      return [];
    }
  };

  const loadGeneralTopics = async (fieldCode: string, areaCode: string) => {
    const key = `${fieldCode}:${areaCode}`;
    if (generalTopicsCache[key]) return generalTopicsCache[key];
    
    try {
      // Buscar tópicos da área específica
      const topics = await questionTopicsApi.searchQuestionTopics({ 
        field_code: fieldCode,
        area_code: areaCode 
      });
      
      // Extrair tópicos gerais únicos com seus códigos
      const generalTopicsMap = new Map<string, GeneralTopicData>();
      topics.forEach(topic => {
        if (!generalTopicsMap.has(topic.general_topic_code)) {
          generalTopicsMap.set(topic.general_topic_code, {
            name: topic.general_topic,
            code: topic.general_topic_code
          });
        }
      });
      
      const generalTopics = Array.from(generalTopicsMap.values());
      
      setGeneralTopicsCache((prev: any) => ({ ...prev, [key]: generalTopics }));
      return generalTopics;
    } catch (error) {
      console.error('Error loading general topics:', error);
      return [];
    }
  };

  const loadSpecificTopics = async (fieldCode: string, areaCode: string, generalTopicCode: string) => {
    const key = `${fieldCode}:${areaCode}:${generalTopicCode}`;
    if (specificTopicsCache[key]) return specificTopicsCache[key];
    
    try {
      // Buscar tópicos do tópico geral específico
      const topics = await questionTopicsApi.searchQuestionTopics({ 
        field_code: fieldCode,
        area_code: areaCode,
        general_topic_code: generalTopicCode
      });
      
      // Extrair tópicos específicos únicos
      const specificTopicsSet = new Set<string>();
      topics.forEach(topic => {
        specificTopicsSet.add(topic.specific_topic);
      });
      
      const specificTopics = Array.from(specificTopicsSet);
      setSpecificTopicsCache((prev: any) => ({ ...prev, [key]: specificTopics }));
      return specificTopics;
    } catch (error) {
      console.error('Error loading specific topics:', error);
      return [];
    }
  };

  const toggleFieldExpansion = async (fieldCode: string) => {
    if (expandedField === fieldCode) {
      setExpandedField(null);
    } else {
      setExpandedField(fieldCode);
      await loadAreas(fieldCode);
    }
  };

  const toggleAreaExpansion = async (fieldCode: string, areaCode: string) => {
    const key = `${fieldCode}:${areaCode}`;
    const isExpanded = expandedAreas[key];
    
    setExpandedAreas((prev: any) => ({ ...prev, [key]: !isExpanded }));
    
    if (!isExpanded) {
      await loadGeneralTopics(fieldCode, areaCode);
    }
  };

  const toggleGeneralTopicExpansion = async (fieldCode: string, areaCode: string, generalTopicCode: string) => {
    const key = `${fieldCode}:${areaCode}:${generalTopicCode}`;
    const isExpanded = expandedGeneralTopics[key];
    
    setExpandedGeneralTopics((prev: any) => ({ ...prev, [key]: !isExpanded }));
    
    if (!isExpanded) {
      await loadSpecificTopics(fieldCode, areaCode, generalTopicCode);
    }
  };

  const handleAreaToggle = (fieldCode: string, areaCode: string, checked: boolean) => {
    setSelections((prev: any) => {
      const newSelections = { ...prev };
      
      if (!newSelections[fieldCode]) {
        newSelections[fieldCode] = { fieldCode, areas: {} };
      }
      
      if (!newSelections[fieldCode].areas[areaCode]) {
        newSelections[fieldCode].areas[areaCode] = {
          selected: false,
          generalTopics: {}
        };
      }
      
      newSelections[fieldCode].areas[areaCode].selected = checked;
      
      return newSelections;
    });
  };

  const handleGeneralTopicToggle = (
    fieldCode: string, 
    areaCode: string, 
    generalTopicCode: string, 
    checked: boolean
  ) => {
    setSelections((prev: any) => {
      const newSelections = { ...prev };
      
      if (!newSelections[fieldCode]) {
        newSelections[fieldCode] = { fieldCode, areas: {} };
      }
      
      if (!newSelections[fieldCode].areas[areaCode]) {
        newSelections[fieldCode].areas[areaCode] = {
          selected: false,
          generalTopics: {}
        };
      }
      
      if (!newSelections[fieldCode].areas[areaCode].generalTopics[generalTopicCode]) {
        newSelections[fieldCode].areas[areaCode].generalTopics[generalTopicCode] = {
          selected: false,
          specificTopics: new Set()
        };
      }
      
      newSelections[fieldCode].areas[areaCode].generalTopics[generalTopicCode].selected = checked;
      
      return newSelections;
    });
  };

  const handleSpecificTopicToggle = (
    fieldCode: string,
    areaCode: string,
    generalTopicCode: string,
    specificTopic: string,
    checked: boolean
  ) => {
    setSelections((prev: any) => {
      const newSelections = { ...prev };
      
      if (!newSelections[fieldCode]) {
        newSelections[fieldCode] = { fieldCode, areas: {} };
      }
      
      if (!newSelections[fieldCode].areas[areaCode]) {
        newSelections[fieldCode].areas[areaCode] = {
          selected: false,
          generalTopics: {}
        };
      }
      
      if (!newSelections[fieldCode].areas[areaCode].generalTopics[generalTopicCode]) {
        newSelections[fieldCode].areas[areaCode].generalTopics[generalTopicCode] = {
          selected: false,
          specificTopics: new Set()
        };
      }
      
      const specificTopics = newSelections[fieldCode].areas[areaCode].generalTopics[generalTopicCode].specificTopics;
      
      if (checked) {
        specificTopics.add(specificTopic);
      } else {
        specificTopics.delete(specificTopic);
      }
      
      return newSelections;
    });
  };

  const updateTopicIds = async () => {
    const topicIds: string[] = [];
    
    try {
      for (const fieldCode in selections) {
        const fieldSelection = selections[fieldCode];
        
        for (const areaCode in fieldSelection.areas) {
          const areaSelection = fieldSelection.areas[areaCode];
          
          // Se a área está selecionada e não tem tópicos gerais específicos
          if (areaSelection.selected && Object.keys(areaSelection.generalTopics).length === 0) {
            // Buscar todos os topics dessa área
            const topics = await questionTopicsApi.searchQuestionTopics({
              field_code: fieldCode,
              area_code: areaCode
            });
            topicIds.push(...topics.map(t => t.id));
            continue;
          }
          
          for (const generalTopicCode in areaSelection.generalTopics) {
            const generalTopicSelection = areaSelection.generalTopics[generalTopicCode];
            
            // Se o tópico geral está selecionado e não tem específicos
            if (generalTopicSelection.selected && generalTopicSelection.specificTopics.size === 0) {
              // Buscar todos os topics desse tópico geral
              const topics = await questionTopicsApi.searchQuestionTopics({
                field_code: fieldCode,
                area_code: areaCode,
                general_topic_code: generalTopicCode
              });
              topicIds.push(...topics.map(t => t.id));
              continue;
            }
            
            // Se há tópicos específicos selecionados
            if (generalTopicSelection.specificTopics.size > 0) {
              for (const specificTopic of generalTopicSelection.specificTopics) {
                const topics = await questionTopicsApi.searchQuestionTopics({
                  field_code: fieldCode,
                  area_code: areaCode,
                  general_topic_code: generalTopicCode,
                  specific_topic: specificTopic
                });
                topicIds.push(...topics.map(t => t.id));
              }
            }
          }
        }
      }
      
      onTopicsChange([...new Set(topicIds)]); // Remove duplicatas
    } catch (error) {
      console.error('Error updating topic IDs:', error);
    }
  };

  const clearAllFilters = () => {
    setSelections({});
    setExpandedField(null);
    setExpandedAreas({});
    setExpandedGeneralTopics({});
  };

  const getSelectedCount = () => {
    let count = 0;
    for (const field in selections) {
      const fieldSelection = selections[field];
      for (const area in fieldSelection.areas) {
        const areaSelection = fieldSelection.areas[area];
        if (areaSelection.selected) count++;
        for (const generalTopic in areaSelection.generalTopics) {
          const generalTopicSelection = areaSelection.generalTopics[generalTopic];
          if (generalTopicSelection.selected) count++;
          count += generalTopicSelection.specificTopics.size;
        }
      }
    }
    return count;
  };

  return (
    <Card className="shadow-lg border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Filtros de Tópicos</CardTitle>
              <CardDescription className="mt-1">
                Selecione os tópicos específicos para seu estudo
              </CardDescription>
            </div>
          </div>
          {getSelectedCount() > 0 && (
            <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm font-semibold">
              {getSelectedCount()} selecionado{getSelectedCount() > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Botão para limpar filtros */}
          {getSelectedCount() > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar todos os filtros
              </Button>
              <Separator className="my-4" />
            </>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
              <p className="text-gray-500 text-sm">Carregando campos disponíveis...</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {fields.map((field: any) => {
                  const hasSelection = selections[field.code] && Object.keys(selections[field.code].areas).length > 0;
                  
                  return (
                    <div 
                      key={field.code} 
                      className={`border-2 rounded-xl p-3 transition-all duration-200 ${
                        hasSelection 
                          ? 'border-blue-300 bg-blue-50/50 shadow-sm' 
                          : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'
                      }`}
                    >
                      {/* Campo */}
                      <button
                        onClick={() => toggleFieldExpansion(field.code)}
                        className="w-full flex items-center justify-between gap-3 text-left font-semibold hover:text-blue-600 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {expandedField === field.code ? (
                            <ChevronDown className="w-5 h-5 text-blue-600 transition-transform" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          )}
                          <span className="text-base">{field.name}</span>
                        </div>
                        {hasSelection && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        )}
                      </button>

                      {/* Áreas */}
                      {expandedField === field.code && (
                        <div className="ml-8 mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                          {areasCache[field.code]?.map((area: any) => {
                            const areaHasSelection = selections[field.code]?.areas[area.code];
                            const isAreaExpanded = expandedAreas[`${field.code}:${area.code}`];
                            
                            return (
                              <div 
                                key={area.code} 
                                className={`border rounded-lg p-2.5 transition-all ${
                                  areaHasSelection?.selected || (areaHasSelection && Object.keys(areaHasSelection.generalTopics).length > 0)
                                    ? 'border-blue-200 bg-blue-50/30'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleAreaExpansion(field.code, area.code)}
                                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                  >
                                    {isAreaExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                  <Checkbox
                                    id={`area-${field.code}-${area.code}`}
                                    checked={selections[field.code]?.areas[area.code]?.selected || false}
                                    onCheckedChange={(checked: any) => 
                                      handleAreaToggle(field.code, area.code, checked as boolean)
                                    }
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  />
                                  <Label 
                                    htmlFor={`area-${field.code}-${area.code}`} 
                                    className="cursor-pointer font-medium text-sm flex-1 hover:text-blue-600 transition-colors"
                                  >
                                    {area.name}
                                  </Label>
                                  {areaHasSelection?.selected && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      Área completa
                                    </Badge>
                                  )}
                                </div>

                                {/* Tópicos Gerais */}
                                {isAreaExpanded && (
                                  <div className="ml-6 mt-2 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                                    {generalTopicsCache[`${field.code}:${area.code}`]?.map((generalTopic: any) => {
                                      const topicHasSelection = selections[field.code]?.areas[area.code]?.generalTopics[generalTopic.code];
                                      const isTopicExpanded = expandedGeneralTopics[`${field.code}:${area.code}:${generalTopic.code}`];
                                      
                                      return (
                                        <div 
                                          key={generalTopic.code} 
                                          className={`border rounded-md p-2 transition-all ${
                                            topicHasSelection?.selected || (topicHasSelection && topicHasSelection.specificTopics.size > 0)
                                              ? 'border-blue-200 bg-blue-50/20'
                                              : 'border-gray-100 hover:border-gray-200'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => toggleGeneralTopicExpansion(field.code, area.code, generalTopic.code)}
                                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                            >
                                              {isTopicExpanded ? (
                                                <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                                              ) : (
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                              )}
                                            </button>
                                            <Checkbox
                                              id={`general-${field.code}-${area.code}-${generalTopic.code}`}
                                              checked={
                                                selections[field.code]?.areas[area.code]?.generalTopics[generalTopic.code]?.selected || false
                                              }
                                              onCheckedChange={(checked: any) =>
                                                handleGeneralTopicToggle(field.code, area.code, generalTopic.code, checked as boolean)
                                              }
                                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <Label
                                              htmlFor={`general-${field.code}-${area.code}-${generalTopic.code}`}
                                              className="cursor-pointer text-sm flex-1 hover:text-blue-600 transition-colors"
                                            >
                                              {generalTopic.name}
                                            </Label>
                                            {topicHasSelection?.selected && (
                                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                Tópico completo
                                              </Badge>
                                            )}
                                            {!topicHasSelection?.selected && topicHasSelection && topicHasSelection.specificTopics.size > 0 && (
                                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                                {topicHasSelection.specificTopics.size} específico{topicHasSelection.specificTopics.size > 1 ? 's' : ''}
                                              </Badge>
                                            )}
                                          </div>

                                          {/* Tópicos Específicos */}
                                          {isTopicExpanded && (
                                            <div className="ml-6 mt-2 space-y-1 animate-in slide-in-from-top-1 duration-100">
                                              {specificTopicsCache[`${field.code}:${area.code}:${generalTopic.code}`]?.map((specificTopic: any) => (
                                                <div key={specificTopic} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 transition-colors">
                                                  <Checkbox
                                                    id={`specific-${field.code}-${area.code}-${generalTopic.code}-${specificTopic}`}
                                                    checked={
                                                      selections[field.code]?.areas[area.code]?.generalTopics[generalTopic.code]?.specificTopics.has(specificTopic) || false
                                                    }
                                                    onCheckedChange={(checked: any) =>
                                                      handleSpecificTopicToggle(
                                                        field.code,
                                                        area.code,
                                                        generalTopic.code,
                                                        specificTopic,
                                                        checked as boolean
                                                      )
                                                    }
                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                  />
                                                  <Label
                                                    htmlFor={`specific-${field.code}-${area.code}-${generalTopic.code}-${specificTopic}`}
                                                    className="cursor-pointer text-sm text-gray-700 hover:text-blue-600 transition-colors"
                                                  >
                                                    {specificTopic}
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
