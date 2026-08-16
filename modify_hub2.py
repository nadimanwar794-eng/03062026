import re

with open('artifacts/iic-study-app/src/components/RevisionHub.tsx', 'r') as f:
    content = f.read()

search_notes_end = """                                                                    dangerouslySetInnerHTML={{ __html: noteHtml }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="w-full pt-2">"""

replace_notes_end = """                                                                    dangerouslySetInnerHTML={{ __html: noteHtml }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full pt-2">"""

if search_notes_end in content:
    content = content.replace(search_notes_end, replace_notes_end)
else:
    print("search_notes_end not found")

with open('artifacts/iic-study-app/src/components/RevisionHub.tsx', 'w') as f:
    f.write(content)
