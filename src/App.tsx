import  { useCallback, useEffect, useState } from 'react';

import './App.css';
import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import { v4 as uuidv4 } from "uuid"

import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

export interface Componet {
  componet: (Componet | InputField)[]
  type: "Comp" | "field",
  key?: string
}
export interface InputField {
  type: "Comp" | "field",
  name: string
  value: string
  fieldType: "text" | "number" | "email"
  key?: string
}
export const getSubComponet = (): Componet => {
  return {
    type: "Comp",
    key: uuidv4(),
    componet: []
  }
}
export const getInputField = (): InputField => {
  return { type: "field", name: "name", key: uuidv4(), fieldType: "text", value: "value" }
}
function App() {
  const [jsonComp, setJSONcomp] = useState<Componet>({ type: "Comp", key: uuidv4(), componet: [] });

  const onAddComp = useCallback(() => {
    setJSONcomp((p) => ({
      ...p,
      componet: [...p.componet, getSubComponet()]
    }))
  }, []);

  const onUpdateComp = useCallback((updated: Componet) => setJSONcomp(p => ({ ...p, ...updated })), [])

  const onDeleteElement = useCallback((index: number) => {
    setJSONcomp(p => (
      {
        ...p,
        componet: [...p.componet.slice(0, index),
        ...p.componet.slice(index + 1)]
      }
    ))
  }, [jsonComp.componet.length])

  const onAddElement = useCallback(() => {
    setJSONcomp((p) => ({ ...p, componet: [...p.componet, getInputField()] }))
  }, []);


  return (
    <Box sx={{ border: 1, m: 2,p:1 }}>
      <Componet
        jsonComp={jsonComp}
        onAddComp={onAddComp}
        onAddElement={onAddElement}
        onUpdateComp={onUpdateComp}
        onDeleteElement={onDeleteElement}

      />
    </Box>
  );
}

export default App;



export const Componet = ({
  jsonComp,
  onAddComp,
  onUpdateComp,
  onDeleteElement,
  onAddElement
}: {
  jsonComp: Componet,
  onAddComp: (a: Componet) => void,
  onUpdateComp: (a: Componet) => void,
  onDeleteElement: (a: number) => void,
  onAddElement: (a: InputField) => void
}): JSX.Element => {

  const onUpdateInternalElement = (index: number, comp: Componet | InputField | null) => {
    let updateComp: (Componet | InputField)[] = [...jsonComp.componet]
    if (comp != null) {
      updateComp[index] = { ...updateComp[index], ...comp }
    }
    else
      updateComp = [...updateComp.slice(0, index), ...updateComp.slice(index + 1)]
    onUpdateComp({ ...jsonComp, componet: updateComp })
  }
  const onAddInternalComp = (index: number, comp: Componet | InputField) => {
    onUpdateInternalElement(index, { ...jsonComp, componet: [...(jsonComp.componet[index] as Componet).componet, comp] })
  }
  const onInternalCompDelete = (index: number, deleteIndex: number) => {
    const oldComp = (jsonComp.componet[index] as Componet).componet
    if (oldComp.length == 1) {
      onUpdateInternalElement(index, null)
    }
    else {
      onUpdateInternalElement(index, {
        ... (jsonComp.componet[index] as Componet),
        componet: [...oldComp.slice(0, deleteIndex),
        ...oldComp.slice(deleteIndex + 1)
        ]
      })
    }
  }
  return <>
    {jsonComp.componet.map((item, index) => {
      return item.type == "Comp" ?
        <Box sx={{ border: 1, m: 2,p:1 }}>
          <Componet
            jsonComp={item as Componet}
            onAddElement={(payload) => onAddInternalComp(index, payload)}
            onAddComp={(payload) => onAddInternalComp(index, payload)}
            onUpdateComp={(payload) => onUpdateInternalElement(index, payload)}
            onDeleteElement={(payload) => onInternalCompDelete(index, payload)}
          />
        </Box>
        : <Field
          inputField={item as InputField}
          onChange={(payload) => onUpdateInternalElement(index, payload)}
          onDeleteRule={() => onDeleteElement(index)}
        />
    })}
    <Button onClick={() => onAddElement(getInputField())} variant='contained'>Add Field</Button>
    <Button onClick={() => onAddComp(getSubComponet())} variant='contained' sx={{ m: 2 }}>Add Component</Button>
    {/* <Button onClick={(deleteIndex)=>onInternalCompDelete(index,deleteIndex)}>Component Delete</Button> */}
  </>
}

export const Field = ({
  inputField,
  onDeleteRule,
  onChange
}: {
  inputField: InputField
  onChange: (a: InputField) => void,
  onDeleteRule: () => void
}): JSX.Element => {
  const [edit, setEdit] = useState<boolean>(false);
  const [field, setField] = useState<Field>({ type: inputField.fieldType, name: inputField.name, value: inputField.value })
  const onChangehandle = (value: string | number, name: string) => {
    setField(p => ({ ...p, [`${name}`]: value }))
  }
  useEffect(() => {
    onChange({
      fieldType: field.type,
      name: field.name,
      value: field.value as string,
      key: inputField.key,
      type: inputField.type
    })
  }, [field])
  return <Box sx={{ m: 5 }}>
    {edit ? <>
      <Box>
        <Typography>Name:</Typography>
        <TextField label="name" type={"text"} value={inputField.name} onChange={(e) => { onChangehandle(e.target.value, "name") }} variant='standard' />
      </Box>
      <Box>

        <TextField label="value" type={inputField.fieldType} value={inputField.fieldType == "number" ? +inputField.value : inputField.value} onChange={(e) => { onChangehandle(e.target.value, "value") }} variant='standard' />
      </Box>
      <Box>
        <Select
          label={"Type"}
          value={inputField.fieldType}
          onChange={(e) => {
            onChangehandle(e.target.value, "type")
            onChangehandle("", "value")
          }
          }
          sx={{ minWidth: "200px", my: 2 }}

        >
          <MenuItem >
            <em>None</em>
          </MenuItem>
          <MenuItem value={"text"}>text</MenuItem>
          <MenuItem value={"email"}>email</MenuItem>
          <MenuItem value={"number"}>number</MenuItem>

        </Select>
        <CheckIcon onClick={() => { setEdit(false) }} />
      </Box>
    </> : <Box>
      <TextField label={inputField.name} value={inputField.value} type={inputField.type} variant='standard' onChange={(e) => onChangehandle(e.target.value, "value")} />
      <EditIcon onClick={() => setEdit(true)} />
    </Box>}
    <Button onClick={() => onDeleteRule()} variant='contained' sx={{ m: 1 }}> Delete Field </Button>
  </Box>
}

interface Field {
  type: "text" | "number" | "email",
  name: string,
  value: string | number
}