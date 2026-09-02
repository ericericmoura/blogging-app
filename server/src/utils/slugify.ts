export const slugify = (value: string) => {
    return value
        .toString()
        .normalize('NFD')                   
        .replace(/[\u0300-\u036f]/g, '')     
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')        
        .replace(/\s+/g, '-')                
        .replace(/-+/g, '-')                 
        .replace(/^-+|-+$/g, '');            
};